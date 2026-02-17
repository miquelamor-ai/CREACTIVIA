// CREACTIVITAT — Configuration

const DEFAULT_MODEL = 'gemini-2.5-flash';

export const CONFIG = {
  PROVIDER: localStorage.getItem('creactivitat_provider') || 'gemini',
  MODEL: '', // Will be set below
  API_ENDPOINT: 'https://generativelanguage.googleapis.com/v1beta/models',
  BASE_URL: localStorage.getItem('creactivitat_base_url') || 'https://openrouter.ai/api/v1',
  MAX_OUTPUT_TOKENS: 8192,
  TEMPERATURE: 0.7,
  STORAGE_KEY_API_GEMINI: 'creactivitat_api_key_gemini',
  STORAGE_KEY_API_OPENROUTER: 'creactivitat_api_key_openrouter',
  STORAGE_KEY_MODEL: 'creactivitat_model',
  STORAGE_KEY_PROVIDER: 'creactivitat_provider',
  STORAGE_KEY_BASEURL: 'creactivitat_base_url',
};

// Available models for Google Gemini
export const AVAILABLE_MODELS_GEMINI = [
  { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash (Estable · Recomanat)' },
  { id: 'gemini-2.5-pro', name: 'Gemini 2.5 Pro (Molta qualitat)' },
  { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash (Gran quota)' },
];

// Available models for OpenAI / OpenRouter / Qwen
export const AVAILABLE_MODELS_OPENAI = [
  { id: 'openrouter/free', name: 'Triat per OpenRouter (Més Estable - Gratuït)' },
  { id: 'google/gemini-2.5-pro-exp-03-25:free', name: 'Gemini 2.5 Pro Exp (Gratuït)' },
  { id: 'meta-llama/llama-3.3-70b-instruct:free', name: 'Llama 3.3 70B (Gratuït)' },
  { id: 'mistralai/mistral-small-3.1-24b-instruct:free', name: 'Mistral Small 3.1 (Gratuït)' },
  { id: 'qwen/qwen-2.5-72b-instruct', name: 'Qwen 2.5 72B (Molt potent - Cost)' },
  { id: 'custom', name: 'Model personalitzat...' },
];

export function getApiKey() {
  const key = CONFIG.PROVIDER === 'gemini' ? CONFIG.STORAGE_KEY_API_GEMINI : CONFIG.STORAGE_KEY_API_OPENROUTER;
  // Fallback for migration if someone had the old generic key
  const stored = localStorage.getItem(key);
  if (!stored && CONFIG.PROVIDER === 'gemini') return localStorage.getItem('creactivitat_api_key');
  return stored;
}

export function setApiKey(key) {
  const storageKey = CONFIG.PROVIDER === 'gemini' ? CONFIG.STORAGE_KEY_API_GEMINI : CONFIG.STORAGE_KEY_API_OPENROUTER;
  localStorage.setItem(storageKey, key);
}

export function getModel() {
  const stored = localStorage.getItem(CONFIG.STORAGE_KEY_MODEL);
  const models = getAvailableModels();
  // Validate if stored model still exists in available models (except for custom)
  if (stored === 'custom') return stored;
  const exists = models.find(m => m.id === stored);
  return exists ? stored : (CONFIG.PROVIDER === 'gemini' ? DEFAULT_MODEL : AVAILABLE_MODELS_OPENAI[0].id);
}

export function setModel(modelId) {
  localStorage.setItem(CONFIG.STORAGE_KEY_MODEL, modelId);
  CONFIG.MODEL = modelId;
}

export function setProvider(provider) {
  localStorage.setItem(CONFIG.STORAGE_KEY_PROVIDER, provider);
  CONFIG.PROVIDER = provider;
}

export function getAvailableModels() {
  return CONFIG.PROVIDER === 'gemini' ? AVAILABLE_MODELS_GEMINI : AVAILABLE_MODELS_OPENAI;
}

// Initial sync and cleanup for invalid models
(function initConfig() {
  const currentProvider = localStorage.getItem(CONFIG.STORAGE_KEY_PROVIDER) || 'gemini';
  const currentModel = localStorage.getItem(CONFIG.STORAGE_KEY_MODEL);

  if (currentProvider === 'gemini') {
    const isValid = AVAILABLE_MODELS_GEMINI.some(m => m.id === currentModel);
    if (!isValid && currentModel && currentModel !== 'custom') {
      console.warn(`[Config] Model Gemini invalid detectat (${currentModel}). Resetting to ${DEFAULT_MODEL}.`);
      localStorage.setItem(CONFIG.STORAGE_KEY_MODEL, DEFAULT_MODEL);
    }
  }

  CONFIG.MODEL = getModel();
})();
