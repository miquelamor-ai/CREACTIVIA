// CREACTIVITAT — OpenAI-Compatible API Client
import { CONFIG, getApiKey } from '../config.js';

// Rate limiting state
let lastCallTime = 0;
const MIN_DELAY = 8000; // 8 seconds for safer RPM (especially for free models)

export async function callOpenAI(prompt, options = {}) {
    // RPM Protection: Wait if last call was too recent
    const now = Date.now();
    const timeSinceLast = now - lastCallTime;
    if (timeSinceLast < MIN_DELAY) {
        const waitTime = MIN_DELAY - timeSinceLast;
        console.warn(`[OpenRouter RPM] Esperant ${Math.round(waitTime)}ms per evitar 429...`);
        await new Promise(r => setTimeout(r, waitTime));
    }
    lastCallTime = Date.now();

    const apiKey = getApiKey();
    if (!apiKey) throw new Error('Cal configurar la clau API');

    const baseUrl = localStorage.getItem('creactivitat_base_url') || 'https://openrouter.ai/api/v1';
    const model = options.model || CONFIG.MODEL;

    const body = {
        model: model,
        messages: [{ role: 'user', content: prompt }],
        temperature: options.temperature ?? CONFIG.TEMPERATURE,
        max_tokens: options.maxTokens ?? CONFIG.MAX_OUTPUT_TOKENS,
        // response_format: { type: 'json_object' } // Removed for better compatibility across models
    };

    let attempts = 0;
    const maxAttempts = 5;
    const baseDelay = 10000;

    while (attempts < maxAttempts) {
        try {
            const response = await fetch(`${baseUrl}/chat/completions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`,
                    'HTTP-Referer': 'https://creactivitat.edu',
                    'X-Title': 'Creactivitat'
                },
                body: JSON.stringify(body),
            });

            if (response.status === 429 || (response.status >= 500 && response.status <= 599)) {
                attempts++;
                if (attempts >= maxAttempts) {
                    let errorMsg = `Error API (${response.status})`;
                    try {
                        const err = await response.json();
                        errorMsg = `${errorMsg}: ${err?.error?.message || err?.message || 'Límit de quota superat.'}`;
                    } catch {
                        errorMsg = `${errorMsg}: El servidor està saturat. Prova el model "Triat per OpenRouter" per a més estabilitat.`;
                    }
                    throw new Error(errorMsg);
                }

                const delay = baseDelay * Math.pow(2, attempts - 1) + Math.random() * 1000;
                console.warn(`[OpenRouter] Error ${response.status}. Reintentant en ${Math.round(delay)}ms... (Intent ${attempts}/${maxAttempts})`);
                await new Promise(r => setTimeout(r, delay));
                continue;
            }

            if (!response.ok) {
                const err = await response.json().catch(() => ({}));
                throw new Error(`Error API (${response.status}): ${err?.error?.message || 'Error desconegut'}`);
            }

            const data = await response.json();
            const content = data?.choices?.[0]?.message?.content;
            if (!content) throw new Error('Resposta buida de l\'API');

            try {
                return JSON.parse(content);
            } catch {
                return { rawText: content };
            }
        } catch (e) {
            if (attempts >= maxAttempts - 1) throw e;
            attempts++;
            const delay = baseDelay * Math.pow(2, attempts - 1);
            await new Promise(r => setTimeout(r, delay));
        }
    }
}
