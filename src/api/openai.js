// CREACTIVITAT — OpenRouter API Client
import { CONFIG, getApiKey } from '../config.js';

let lastCallTime = 0;
const MIN_DELAY = 3000;

export async function callOpenAI(prompt, options = {}) {
  const wait = MIN_DELAY - (Date.now() - lastCallTime);
  if (wait > 0) await new Promise(r => setTimeout(r, wait));
  lastCallTime = Date.now();

  const apiKey = getApiKey();
  if (!apiKey) throw new Error('Cal configurar la clau API d\'OpenRouter a la barra lateral esquerra');

  const baseUrl = CONFIG.BASE_URL || 'https://openrouter.ai/api/v1';
  const model = options.model || CONFIG.MODEL;

  console.log(`[OpenRouter] Model: ${model}`);

  const body = {
    model,
    messages: [{ role: 'user', content: prompt }],
    temperature: options.temperature ?? CONFIG.TEMPERATURE,
    max_tokens: options.maxTokens ?? CONFIG.MAX_OUTPUT_TOKENS,
  };

  const maxAttempts = 3;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    let response;
    try {
      response = await fetch(`${baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
          'HTTP-Referer': 'https://creactivitat.edu',
          'X-Title': 'Creactivitat',
        },
        body: JSON.stringify(body),
      });
    } catch (networkErr) {
      throw new Error(`Error de xarxa: ${networkErr.message}`);
    }

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      const msg = err?.error?.message || 'Error desconegut';

      // Error 401/403: clau invàlida
      if (response.status === 401 || response.status === 403) {
        throw new Error(`Clau OpenRouter invàlida o caducada (${response.status}). Revisa la configuració.`);
      }

      // Error 502: problema d'autenticació (Clerk) o pasarel·la
      if (response.status === 502) {
        throw new Error(`Error 502 d'OpenRouter: Probablement la clau API és invàlida o hi ha un problema de connexió temporal.`);
      }

      throw new Error(`Error OpenRouter (${response.status}): ${msg}`);
    }

    const data = await response.json();
    const content = data?.choices?.[0]?.message?.content;
    if (!content) throw new Error('OpenRouter no ha retornat contingut. Prova un altre model.');

    console.log(`[OpenRouter] OK (${content.length} chars)`);
    return parseJSON(content);
  }
}

export async function verifyOpenRouterKey(key) {
  const baseUrl = CONFIG.BASE_URL || 'https://openrouter.ai/api/v1';
  try {
    const response = await fetch(`${baseUrl}/auth/key`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${key}`,
        'HTTP-Referer': 'https://creactivitat.edu',
        'X-Title': 'Creactivitat',
      },
    });
    const data = await response.json();
    if (response.ok) return { ok: true, data };
    return { ok: false, message: data?.error?.message || `Error ${response.status}` };
  } catch (e) {
    return { ok: false, message: e.message };
  }
}

function parseJSON(text) {
  try { return JSON.parse(text); } catch { }
  const block = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  if (block) try { return JSON.parse(block[1]); } catch { }
  const obj = text.match(/\{[\s\S]*\}/);
  if (obj) try { return JSON.parse(obj[0]); } catch { }
  return { rawText: text };
}
