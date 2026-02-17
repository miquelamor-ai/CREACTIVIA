// CREACTIVITAT — Unified LLM Provider
import { CONFIG } from '../config.js';
import { callGemini } from './gemini.js';
import { callOpenAI } from './openai.js';

/**
 * Call the configured LLM provider.
 * @param {string} prompt 
 * @param {object} options 
 * @returns {Promise<object>}
 */
export async function callLLM(prompt, options = {}) {
    const provider = CONFIG.PROVIDER;

    if (provider === 'openai' || provider === 'openrouter') {
        return await callOpenAI(prompt, options);
    }

    // Default to Gemini
    return await callGemini(prompt, options);
}
