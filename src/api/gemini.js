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
  if (!apiKey) throw new Error('Key Gemini no trobada');

  const modelBase = options.model || CONFIG.MODEL;
  const versions = ['v1', 'v1beta'];
  // Simplifiquem alies per no provar combinacions inexistents que confonguin
  const aliases = [modelBase];
  if (!modelBase.includes('-')) aliases.push(`${modelBase}-latest`);

  let lastError = null;

  // Intentem cada versió i cada alies fins que un funcioni
  for (const v of versions) {
    for (const model of aliases) {
      // Intent 1: Amb totes les opcions
      const body = {
        contents: options.contents || [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: options.temperature ?? CONFIG.TEMPERATURE,
          maxOutputTokens: options.maxTokens ?? CONFIG.MAX_OUTPUT_TOKENS,
          ...(options.responseMimeType ? { responseMimeType: options.responseMimeType } : {})
        },
        safetySettings: [
          { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
          { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
          { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
          { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
        ],
      };

      let currentUrl = `${CONFIG.API_ENDPOINT}/${v}/models/${model}:generateContent?key=${apiKey}`;

      try {
        const response = await fetch(currentUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });

        const data = await response.json().catch(() => ({}));

        if (response.ok) {
          const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (!text) throw new Error('Resposta buida de Gemini');
          console.log(`[Gemini] OK via ${v}/${model}`);
          return parseJSON(text);
        }

        // Si és un error de "Unknown name responseMimeType", reintentem SENSE aquest camp
        if (response.status === 400 && data.error?.message?.includes('responseMimeType')) {
          console.warn(`[Gemini] ${model} no suporta responseMimeType a ${v}. Reintentant sense...`);
          delete body.generationConfig.responseMimeType;
          const retryRes = await fetch(currentUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
          });
          const retryData = await retryRes.json().catch(() => ({}));
          if (retryRes.ok) {
            const text = retryData?.candidates?.[0]?.content?.parts?.[0]?.text;
            return parseJSON(text);
          }
        }

        if (response.status === 404) {
          lastError = `El model "${model}" no s'ha trobat a l'endpoint ${v}.`;
          continue;
        }

        if (response.status === 429) {
          const detail = data.error?.message || "";
          if (detail.includes("limit: 0")) {
            throw new Error(`Quota: El model "${model}" no està actiu per a la teva clau (Límit 0). Prova un altre model o revisa el teu compte de Google.`);
          }
          throw new Error(`Quota excedida (429): ${detail}`);
        }

        throw new Error(data.error?.message || `Error HTTP ${response.status}`);
      } catch (e) {
        lastError = e.message;
        // Si és un error de xarxa o de quota/key intolerable, parem
        if (e.message.includes('Quota')) throw e;
        if (!e.message.includes('no trobat') && !e.message.includes('no s\'ha trobat') && !e.message.includes('no suporta')) throw e;
      }
    }
  }

  throw new Error(`Error Gemini: ${lastError || 'No s\'han trobat models vàlids.'}`);
}

export async function verifyGeminiKey(key) {
  const versions = ['v1', 'v1beta'];
  // Models per provar la clau
  const testModels = ['gemini-2.0-flash', 'gemini-1.5-flash', 'gemini-1.5-flash-8b'];
  let attempts = [];
  let discoveredModels = [];

  // 1. Intentem ListModels per descobrir què permet realment aquesta clau
  for (const v of versions) {
    try {
      const listUrl = `${CONFIG.API_ENDPOINT}/${v}/models?key=${key}`;
      const listRes = await fetch(listUrl);
      if (listRes.ok) {
        const listData = await listRes.json();
        const available = listData.models
          ?.filter(m => m.supportedGenerationMethods?.includes('generateContent'))
          ?.map(m => m.name.replace('models/', '')) || [];

        if (available.length > 0) {
          discoveredModels = [...new Set([...discoveredModels, ...available])];
          console.log(`[Gemini] Models trobats a ${v}:`, available);
          // Triem un model per la prova real
          const best = available.find(m => m.includes('flash')) || available[0];
          const testUrl = `${CONFIG.API_ENDPOINT}/${v}/models/${best}:generateContent?key=${key}`;
          const testRes = await fetch(testUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts: [{ text: 'hola' }] }], generationConfig: { maxOutputTokens: 5 } }),
          });
          if (testRes.ok) return { ok: true, model: best, version: v, models: discoveredModels };
        }
      } else {
        const err = await listRes.json().catch(() => ({}));
        const errMsg = err.error?.message || listRes.status;
        if (!attempts.includes(`ListModels(${v}): ${errMsg}`)) {
          attempts.push(`ListModels(${v}): ${errMsg}`);
        }
      }
    } catch (e) {
      attempts.push(`ListModels(${v}): Error xarxa`);
    }
  }

  // 2. Fallback a intents manuals amb models coneguts
  for (const v of versions) {
    for (const model of testModels) {
      const url = `${CONFIG.API_ENDPOINT}/${v}/models/${model}:generateContent?key=${key}`;
      try {
        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contents: [{ parts: [{ text: 'hola' }] }], generationConfig: { maxOutputTokens: 5 } }),
        });
        const data = await response.json().catch(() => ({}));
        if (response.ok) return { ok: true, model, version: v, models: discoveredModels };

        const errMsg = data.error?.message || response.status;
        if (!attempts.includes(`${v}/${model}: ${errMsg}`)) {
          attempts.push(`${v}/${model}: ${errMsg}`);
        }
      } catch (e) {
        attempts.push(`${v}/${model}: Error xarxa`);
      }
    }
  }

  return {
    ok: false,
    message: `No s'ha pogut connectar. Detalls:\n- ${attempts.slice(-3).join('\n- ')}`,
    models: discoveredModels
  };
}

function parseJSON(text) {
  text = text.trim()
    .replace(/^```json\s*/i, '')
    .replace(/```\s*$/i, '')
    .trim();

  try { return JSON.parse(text); } catch { }

  const match = text.match(/\{[\s\S]*\}/);
  if (match) {
    try { return JSON.parse(match[0]); } catch { }
  }

  return { rawText: text };
}
