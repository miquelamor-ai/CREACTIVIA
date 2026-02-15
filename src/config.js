// CREACTIVITAT — Configuration

const DEFAULT_MODEL = 'gemini-1.5-flash';

export const CONFIG = {
  MODEL: localStorage.getItem('creactivitat_model') || DEFAULT_MODEL,
  API_ENDPOINT: 'https://generativelanguage.googleapis.com/v1beta/models',
  MAX_OUTPUT_TOKENS: 8192,
  TEMPERATURE: 0.7,
  STORAGE_KEY_API: 'creactivitat_api_key',
  STORAGE_KEY_MODEL: 'creactivitat_model',
};

// Available models for the settings dropdown
export const AVAILABLE_MODELS = [
  { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash (Recomanat)' },
  { id: 'gemini-1.5-flash-001', name: 'Gemini 1.5 Flash (v001)' },
  { id: 'gemini-1.5-flash-latest', name: 'Gemini 1.5 Flash (Latest)' },
  { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro (Potent)' },
  { id: 'gemini-1.5-pro-latest', name: 'Gemini 1.5 Pro (Latest)' },
  { id: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash (Experimental)' },
];

export function getApiKey() {
  return localStorage.getItem(CONFIG.STORAGE_KEY_API);
}

export function setApiKey(key) {
  localStorage.setItem(CONFIG.STORAGE_KEY_API, key);
}

export function getModel() {
  return localStorage.getItem(CONFIG.STORAGE_KEY_MODEL) || DEFAULT_MODEL;
}

export function setModel(modelId) {
  localStorage.setItem(CONFIG.STORAGE_KEY_MODEL, modelId);
  CONFIG.MODEL = modelId;
}

export function getAvailableModels() {
  return AVAILABLE_MODELS;
}
