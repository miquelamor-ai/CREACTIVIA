// CREACTIVITAT — Gemini API Client
import { CONFIG, getApiKey } from '../config.js';

export async function callGemini(prompt, options = {}) {
    const apiKey = getApiKey();
    if (!apiKey) throw new Error('Cal configurar la clau API de Gemini');

    const model = options.model || CONFIG.MODEL;
    const url = `${CONFIG.API_ENDPOINT}/${model}:generateContent?key=${apiKey}`;

    const body = {
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
            temperature: options.temperature ?? CONFIG.TEMPERATURE,
            maxOutputTokens: options.maxTokens ?? CONFIG.MAX_OUTPUT_TOKENS,
            responseMimeType: 'application/json',
        },
        safetySettings: [
            { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
            { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
            { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
            { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
        ],
    };

    let attempts = 0;
    const maxAttempts = 3;
    const baseDelay = 4000; // Start with 4s delay for 429s

    while (attempts < maxAttempts) {
        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });

            if (response.status === 429) {
                attempts++;
                if (attempts >= maxAttempts) throw new Error('Massa peticions (429). Torna-ho a provar en uns minuts.');

                // Exponential backoff with jitter
                const delay = baseDelay * Math.pow(2, attempts - 1) + Math.random() * 1000;
                console.warn(`Error 429. Retrying in ${Math.round(delay)}ms...`);
                await new Promise(r => setTimeout(r, delay));
                continue;
            }

            if (!response.ok) {
                const err = await response.json().catch(() => ({}));
                throw new Error(`Error API Gemini (${response.status}): ${err?.error?.message || 'Error desconegut'}`);
            }

            const data = await response.json();
            const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
            if (!text) throw new Error('Resposta buida de Gemini');

            // Try to parse JSON; if responseMimeType worked, it should be valid JSON
            try {
                return JSON.parse(text);
            } catch {
                // If JSON parsing fails, return the raw text wrapped in an object
                return { rawText: text };
            }

        } catch (error) {
            if (attempts >= maxAttempts && error.message.includes('429')) throw error;
            if (!error.message.includes('429')) throw error; // If not 429, throw immediately unless we are in the loop
            // If we are here, it was a 429 inside the try block (thrown manually or via fetch error if handled differently)
            // But our logic handles 429 via response.status check.
            // So this catch block mostly catches network errors or the final 429 error throw.
            throw error;
        }
    }
}
