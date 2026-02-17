// CREACTIVITAT — Configuration

const DEFAULT_MODEL_GEMINI = 'gemini-2.5-flash';
const DEFAULT_MODEL_OPENROUTER = 'openrouter/free';

export const CONFIG = {
  PROVIDER: localStorage.getItem('creactivitat_provider') || 'gemini',
  MODEL: '',
  // v1beta és necessari per models "preview" i nous.
  // Endpoint base de Google (triarem la versió al client)
  API_ENDPOINT: 'https://generativelanguage.googleapis.com',
  BASE_URL: localStorage.getItem('creactivitat_base_url') || 'https://openrouter.ai/api/v1',
  MAX_OUTPUT_TOKENS: 8192,
  TEMPERATURE: 0.7,
  STORAGE_KEY_API_GEMINI: 'creactivitat_api_key_gemini',
  STORAGE_KEY_API_OPENROUTER: 'creactivitat_api_key_openrouter',
  STORAGE_KEY_MODEL: 'creactivitat_model',
  STORAGE_KEY_PROVIDER: 'creactivitat_provider',
  STORAGE_KEY_BASEURL: 'creactivitat_base_url',
};

// Models Gemini — verificats febrer 2026 amb endpoint v1
export const AVAILABLE_MODELS_GEMINI = [
  { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash ⭐ (Recomanat 2026)' },
  { id: 'gemini-3.0-pro', name: 'Gemini 3 Pro (Màxima potència 2026)' },
  { id: 'gemini-2.5-flash-lite', name: 'Gemini 2.5 Flash Lite (Molt ràpid 2026)' },
  { id: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash (Estable)' },
  { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash (Fiable)' },
  { id: 'gemini-1.5-flash-8b', name: 'Gemini 1.5 Flash 8B (Lleuger)' },
];

// Models OpenRouter — gratuïts i verificats febrer 2026
export const AVAILABLE_MODELS_OPENAI = [
  { id: 'openrouter/free', name: 'Selecció Automàtica (El més estable ⭐)' },
  { id: 'google/gemini-2.0-flash-exp:free', name: 'Gemini 2.0 Flash (Gratuït)' },
  { id: 'deepseek/deepseek-r1:free', name: 'DeepSeek R1 (Raonament · Gratuït)' },
  { id: 'meta-llama/llama-3.3-70b-instruct:free', name: 'Llama 3.3 70B (Gratuït)' },
  { id: 'qwen/qwen-2.5-72b-instruct:free', name: 'Qwen 2.5 72B (Gratuït)' },
];

export function getApiKey() {
  const key = CONFIG.PROVIDER === 'gemini'
    ? CONFIG.STORAGE_KEY_API_GEMINI
    : CONFIG.STORAGE_KEY_API_OPENROUTER;
  const stored = localStorage.getItem(key);
  // Migració clau antiga
  if (!stored && CONFIG.PROVIDER === 'gemini') return localStorage.getItem('creactivitat_api_key');
  return stored;
}

export function setApiKey(key) {
  const storageKey = CONFIG.PROVIDER === 'gemini'
    ? CONFIG.STORAGE_KEY_API_GEMINI
    : CONFIG.STORAGE_KEY_API_OPENROUTER;
  localStorage.setItem(storageKey, key.trim());
}

export function getModel() {
  const stored = localStorage.getItem(CONFIG.STORAGE_KEY_MODEL);
  const models = getAvailableModels();
  const exists = models.find(m => m.id === stored);
  if (exists) return stored;
  return CONFIG.PROVIDER === 'gemini' ? DEFAULT_MODEL_GEMINI : DEFAULT_MODEL_OPENROUTER;
}

export function setModel(modelId) {
  localStorage.setItem(CONFIG.STORAGE_KEY_MODEL, modelId);
  CONFIG.MODEL = modelId;
}

export function setProvider(provider) {
  localStorage.setItem(CONFIG.STORAGE_KEY_PROVIDER, provider);
  CONFIG.PROVIDER = provider;
  const defaultModel = provider === 'gemini' ? DEFAULT_MODEL_GEMINI : DEFAULT_MODEL_OPENROUTER;
  localStorage.setItem(CONFIG.STORAGE_KEY_MODEL, defaultModel);
  CONFIG.MODEL = defaultModel;
}

export function getAvailableModels() {
  return CONFIG.PROVIDER === 'gemini' ? AVAILABLE_MODELS_GEMINI : AVAILABLE_MODELS_OPENAI;
}

// Init
(function initConfig() {
  CONFIG.PROVIDER = localStorage.getItem(CONFIG.STORAGE_KEY_PROVIDER) || 'gemini';
  CONFIG.MODEL = getModel();
  console.log(`[Config] Provider: ${CONFIG.PROVIDER} | Model: ${CONFIG.MODEL}`);
})();
