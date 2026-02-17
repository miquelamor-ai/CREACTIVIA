// CREACTIVITAT — Gemini API Client (endpoint v1)
import { CONFIG, getApiKey } from '../config.js';

let lastCallTime = 0;
const MIN_DELAY = 3000;

export async function callGemini(prompt, options = {}) {
  // Rate limit
  const wait = MIN_DELAY - (Date.now() - lastCallTime);
  if (wait > 0) await new Promise(r => setTimeout(r, wait));
  lastCallTime = Date.now();

  const apiKey = getApiKey();
  if (!apiKey) throw new Error('Cal configurar la clau API de Google a la barra lateral esquerra');

  const model = options.model || CONFIG.MODEL;
  // Endpoint v1 (estable), NO v1beta
  const url = `https://generativelanguage.googleapis.com/v1/models/${model}:generateContent?key=${apiKey}`;

  console.log(`[Gemini] Model: ${model}`);

  const body = {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: {
      temperature: options.temperature ?? CONFIG.TEMPERATURE,
      maxOutputTokens: options.maxTokens ?? CONFIG.MAX_OUTPUT_TOKENS,
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
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (response.status === 429) {
      if (attempt >= maxAttempts) throw new Error('Quota superada (429). Espera 1 minut i torna-ho a provar, o canvia al model Gemini 2.0 Flash Lite.');
      console.warn(`[Gemini] 429 - Reintentant en ${15 * attempt}s...`);
      await new Promise(r => setTimeout(r, 15000 * attempt));
      continue;
    }

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(`Error Gemini API: ${err?.error?.message || `HTTP ${response.status}`}`);
    }

    const data = await response.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) {
      const reason = data?.promptFeedback?.blockReason;
      throw new Error(`Gemini no ha retornat resposta${reason ? ` (bloquejat: ${reason})` : '. Prova un altre model.'}`);
    }

    console.log(`[Gemini] OK (${text.length} chars)`);
    return parseJSON(text);
  }
}

function parseJSON(text) {
  // 1. JSON directe
  try { return JSON.parse(text); } catch { }
  // 2. Bloc ```json
  const block = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  if (block) try { return JSON.parse(block[1]); } catch { }
  // 3. Primer objecte {}
  const obj = text.match(/\{[\s\S]*\}/);
  if (obj) try { return JSON.parse(obj[0]); } catch { }
  // 4. Retornar com text pla
  return { rawText: text };
}
