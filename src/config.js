// CREACTIVITAT — Configuration

const DEFAULT_MODEL = 'gemini-2.5-flash';

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
  { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash (Estable · Recomanat)' },
  { id: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash (Legacy · Fins Març 2026)' },
  { id: 'gemini-3-flash-preview', name: 'Gemini 3 Flash (Preview · Experimental)' },
];

export function getApiKey() {
  return localStorage.getItem(CONFIG.STORAGE_KEY_API);
}

export function setApiKey(key) {
  localStorage.setItem(CONFIG.STORAGE_KEY_API, key);
}

export function getModel() {
  const stored = localStorage.getItem(CONFIG.STORAGE_KEY_MODEL);
  // Validate if stored model still exists in available models
  const exists = AVAILABLE_MODELS.find(m => m.id === stored);
  return exists ? stored : DEFAULT_MODEL;
}

export function setModel(modelId) {
  localStorage.setItem(CONFIG.STORAGE_KEY_MODEL, modelId);
  CONFIG.MODEL = modelId;
}

export function getAvailableModels() {
  return AVAILABLE_MODELS;
}
