// CREACTIVITAT — Gemini API Client
import { CONFIG, getApiKey } from '../config.js';

let lastCallTime = 0;
const MIN_DELAY = 4000; // 4s entre crides (15 RPM safe)

export async function callGemini(prompt, options = {}) {
  // Respectar rate limit
  const now = Date.now();
  const wait = MIN_DELAY - (now - lastCallTime);
  if (wait > 0) {
    console.log(`[Gemini] Esperant ${wait}ms per rate limit...`);
    await new Promise(r => setTimeout(r, wait));
  }
  lastCallTime = Date.now();

  const apiKey = getApiKey();
  if (!apiKey) throw new Error('Cal configurar la clau API de Gemini a la barra lateral');

  const model = options.model || CONFIG.MODEL;
  const url = `${CONFIG.API_ENDPOINT}/${model}:generateContent?key=${apiKey}`;

  console.log(`[Gemini] Cridant model: ${model}`);

  const body = {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: {
      temperature: options.temperature ?? CONFIG.TEMPERATURE,
      maxOutputTokens: options.maxTokens ?? CONFIG.MAX_OUTPUT_TOKENS,
      // NO forcem responseMimeType aquí perquè alguns models no ho suporten
    },
    safetySettings: [
      { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
    ],
  };

  const maxAttempts = 3;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      // 429: quota superada
      if (response.status === 429) {
        if (attempt >= maxAttempts) {
          throw new Error('Quota superada (429). Prova el model Gemini 1.5 Flash 8B o espera un minut.');
        }
        const delay = 15000 * attempt;
        console.warn(`[Gemini] 429 - Esperant ${delay}ms (intent ${attempt}/${maxAttempts})...`);
        await new Promise(r => setTimeout(r, delay));
        continue;
      }

      if (!response.ok) {
        const errBody = await response.json().catch(() => ({}));
        const msg = errBody?.error?.message || `HTTP ${response.status}`;
        throw new Error(`Error Gemini API: ${msg}`);
      }

      const data = await response.json();

      // Comprovar si el model ha bloquejat la resposta
      const candidate = data?.candidates?.[0];
      if (!candidate) {
        const blockReason = data?.promptFeedback?.blockReason;
        throw new Error(`Resposta buida de Gemini${blockReason ? ` (bloquejada: ${blockReason})` : ''}`);
      }

      const text = candidate?.content?.parts?.[0]?.text;
      if (!text) throw new Error('El model no ha retornat text');

      console.log(`[Gemini] Resposta rebuda (${text.length} chars)`);
      return parseResponse(text);

    } catch (error) {
      if (attempt >= maxAttempts || !error.message.includes('429')) throw error;
    }
  }
}

function parseResponse(text) {
  // Intentar JSON directe
  try {
    return JSON.parse(text);
  } catch { /* no és JSON pur */ }

  // Buscar bloc ```json ... ```
  const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  if (jsonMatch) {
    try {
      return JSON.parse(jsonMatch[1]);
    } catch { /* bloc malformat */ }
  }

  // Buscar el primer { ... } de l'string
  const objectMatch = text.match(/(\{[\s\S]*\})/);
  if (objectMatch) {
    try {
      return JSON.parse(objectMatch[1]);
    } catch { /* tampoc */ }
  }

  // Retornar com rawText per processar manualment
  return { rawText: text };
}
