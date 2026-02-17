// CREACTIVITAT — OpenRouter API Client
import { CONFIG, getApiKey } from '../config.js';

let lastCallTime = 0;
const MIN_DELAY = 3000; // 3s entre crides

export async function callOpenAI(prompt, options = {}) {
  const now = Date.now();
  const wait = MIN_DELAY - (now - lastCallTime);
  if (wait > 0) {
    console.log(`[OpenRouter] Esperant ${wait}ms per rate limit...`);
    await new Promise(r => setTimeout(r, wait));
  }
  lastCallTime = Date.now();

  const apiKey = getApiKey();
  if (!apiKey) throw new Error('Cal configurar la clau API d\'OpenRouter a la barra lateral');

  const baseUrl = CONFIG.BASE_URL || 'https://openrouter.ai/api/v1';
  const model = options.model || CONFIG.MODEL;

  console.log(`[OpenRouter] Cridant model: ${model} via ${baseUrl}`);

  const body = {
    model,
    messages: [{ role: 'user', content: prompt }],
    temperature: options.temperature ?? CONFIG.TEMPERATURE,
    max_tokens: options.maxTokens ?? CONFIG.MAX_OUTPUT_TOKENS,
  };

  const maxAttempts = 3;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const response = await fetch(`${baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
          'HTTP-Referer': 'https://creactivitat.edu',
          'X-Title': 'Creactivitat',
        },
        body: JSON.stringify(body),
      });

      if (response.status === 429 || response.status >= 500) {
        if (attempt >= maxAttempts) {
          const errBody = await response.json().catch(() => ({}));
          throw new Error(`Error ${response.status}: ${errBody?.error?.message || 'Servidor saturat. Prova un altre model.'}`);
        }
        const delay = 10000 * attempt;
        console.warn(`[OpenRouter] ${response.status} - Esperant ${delay}ms (intent ${attempt})...`);
        await new Promise(r => setTimeout(r, delay));
        continue;
      }

      if (!response.ok) {
        const errBody = await response.json().catch(() => ({}));
        throw new Error(`Error OpenRouter (${response.status}): ${errBody?.error?.message || 'Error desconegut'}`);
      }

      const data = await response.json();
      const content = data?.choices?.[0]?.message?.content;
      if (!content) throw new Error('Resposta buida d\'OpenRouter');

      console.log(`[OpenRouter] Resposta rebuda (${content.length} chars)`);
      return parseResponse(content);

    } catch (error) {
      if (attempt >= maxAttempts) throw error;
      if (!error.message.includes('429') && !error.message.includes('500')) throw error;
      await new Promise(r => setTimeout(r, 8000));
    }
  }
}

function parseResponse(text) {
  try { return JSON.parse(text); } catch { /* no JSON pur */ }

  const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  if (jsonMatch) {
    try { return JSON.parse(jsonMatch[1]); } catch { /* bloc malformat */ }
  }

  const objectMatch = text.match(/(\{[\s\S]*\})/);
  if (objectMatch) {
    try { return JSON.parse(objectMatch[1]); } catch { /* tampoc */ }
  }

  return { rawText: text };
}
