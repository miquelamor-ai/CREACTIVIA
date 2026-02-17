// CREACTIVITAT — Configuration

const DEFAULT_MODEL_GEMINI = 'gemini-1.5-flash';
const DEFAULT_MODEL_OPENROUTER = 'google/gemini-2.0-flash-exp:free';

export const CONFIG = {
  PROVIDER: localStorage.getItem('creactivitat_provider') || 'gemini',
  MODEL: '',
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

// Models Gemini (oficials i verificats feb 2026)
export const AVAILABLE_MODELS_GEMINI = [
  { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash ⭐ (Recomanat · Estable)' },
  { id: 'gemini-1.5-flash-8b', name: 'Gemini 1.5 Flash 8B (Ràpid · Quota alta)' },
  { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro (Alta qualitat · Quota baixa)' },
  { id: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash (Nou · Experimental)' },
];

// Models OpenRouter (gratuïts i verificats feb 2026)
export const AVAILABLE_MODELS_OPENAI = [
  { id: 'google/gemini-2.0-flash-exp:free', name: 'Gemini 2.0 Flash Exp ⭐ (Recomanat · Gratuït)' },
  { id: 'google/gemini-flash-1-5:free', name: 'Gemini 1.5 Flash (Gratuït · Estable)' },
  { id: 'meta-llama/llama-3.3-70b-instruct:free', name: 'Llama 3.3 70B (Gratuït)' },
  { id: 'mistralai/mistral-small-3.1-24b-instruct:free', name: 'Mistral Small 3.1 (Gratuït)' },
  { id: 'deepseek/deepseek-chat-v3-0324:free', name: 'DeepSeek V3 (Gratuït · Molt potent)' },
  { id: 'qwen/qwen-2.5-72b-instruct:free', name: 'Qwen 2.5 72B (Gratuït)' },
];

export function getApiKey() {
  const key = CONFIG.PROVIDER === 'gemini'
    ? CONFIG.STORAGE_KEY_API_GEMINI
    : CONFIG.STORAGE_KEY_API_OPENROUTER;
  const stored = localStorage.getItem(key);
  // Migració de clau antiga genèrica
  if (!stored && CONFIG.PROVIDER === 'gemini') return localStorage.getItem('creactivitat_api_key');
  return stored;
}

export function setApiKey(key) {
  const storageKey = CONFIG.PROVIDER === 'gemini'
    ? CONFIG.STORAGE_KEY_API_GEMINI
    : CONFIG.STORAGE_KEY_API_OPENROUTER;
  localStorage.setItem(storageKey, key);
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
  // Reset model to default for new provider
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
  console.log(`[Config] Provider: ${CONFIG.PROVIDER}, Model: ${CONFIG.MODEL}`);
})();
