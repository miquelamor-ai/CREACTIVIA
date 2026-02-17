// CREACTIVITAT — Settings UI

import { CONFIG, getApiKey, setApiKey, getModel, setModel, getAvailableModels } from '../config.js';
import { testConnection } from '../api/llm-provider.js';

export function renderSettingsModal(container, onClose) {
  const apiKey = getApiKey() || '';
  const currentModel = getModel();
  const models = getAvailableModels();

  container.innerHTML = `
    <div class="modal-backdrop">
      <div class="modal">
        <div class="modal-header">
          <h3>⚙️ Configuració</h3>
          <button class="btn-close">×</button>
        </div>
        <div class="modal-body">
          
          <!-- Provider Section -->
          <div class="form-group">
            <label class="form-label">Proveïdor d'IA</label>
            <select id="settings-provider" class="form-select">
              <option value="gemini" ${CONFIG.PROVIDER === 'gemini' ? 'selected' : ''}>Google Gemini (Oficial)</option>
              <option value="openai" ${CONFIG.PROVIDER === 'openai' ? 'selected' : ''}>OpenRouter / Qwen / OpenAI compatible</option>
            </select>
          </div>

          <!-- Model Section -->
          <div class="form-group">
            <label class="form-label">Model IA</label>
            <div id="model-select-wrapper">
              <select id="settings-model" class="form-select">
                ${models.map(m => `
                  <option value="${m.id}" ${m.id === currentModel ? 'selected' : ''}>
                    ${m.name} ${m.id !== 'custom' ? `(${m.id})` : ''}
                  </option>
                `).join('')}
              </select>
              <input type="text" id="settings-custom-model" class="form-input" 
                value="${!models.some(m => m.id === currentModel) || currentModel === 'custom' ? currentModel : ''}" 
                placeholder="Ex: qwen/qwen-2.5-72b-instruct" 
                style="${(currentModel !== 'custom' && models.some(m => m.id === currentModel)) ? 'display:none; margin-top:var(--sp-2)' : 'margin-top:var(--sp-2)'}" />
            </div>
            <p class="form-hint" id="model-hint">
              ${CONFIG.PROVIDER === 'gemini'
      ? 'Si tens errors de "Quota", prova un model Flash.'
      : 'Pots triar un preset o escriure el nom del model d\'OpenRouter.'}
            </p>
          </div>

          <!-- Base URL Section (Conditional) -->
          <div class="form-group" id="base-url-group" ${CONFIG.PROVIDER === 'gemini' ? 'style="display:none"' : ''}>
            <label class="form-label">Base URL (OpenAI compatible)</label>
            <input type="text" id="settings-base-url" class="form-input" value="${CONFIG.BASE_URL}" placeholder="https://openrouter.ai/api/v1" />
            <p class="form-hint">URL de l'API (ex: OpenRouter, Groq, Ollama).</p>
          </div>

          <div class="form-group">
            <label class="form-label">Clau API</label>
            <div style="display: flex; gap: var(--sp-2);">
              <input type="password" id="settings-api-key" class="form-input" value="${apiKey}" placeholder="Enganxa la teva clau API aquí" />
              <button class="btn btn-ghost" id="settings-api-test" title="Prova la connexió">⚡</button>
              <button class="btn btn-ghost" id="toggle-key-vis">👁️</button>
            </div>
          </div>

        </div>
        <div class="modal-footer">
          <button class="btn btn-ghost btn-cancel">Cancel·la</button>
          <button class="btn btn-primary btn-save">Desa els canvis</button>
        </div>
      </div>
    </div>
  `;

  // Styles for modal (inline for simplicity or move to style.css)
  // We'll rely on global styles but ensure backdrop is centered

  // Events
  const closeBtn = container.querySelector('.btn-close');
  const cancelBtn = container.querySelector('.btn-cancel');
  const saveBtn = container.querySelector('.btn-save');
  const toggleVisBtn = container.querySelector('#toggle-key-vis');
  const keyInput = container.querySelector('#settings-api-key');
  const modelSelect = container.querySelector('#settings-model');
  const providerSelect = container.querySelector('#settings-provider');
  const customModelInput = container.querySelector('#settings-custom-model');
  const baseUrlInput = container.querySelector('#settings-base-url');
  const baseUrlGroup = container.querySelector('#base-url-group');
  const testBtn = container.querySelector('#settings-api-test');

  const close = () => {
    container.innerHTML = '';
    if (onClose) onClose();
  };

  closeBtn.addEventListener('click', close);
  cancelBtn.addEventListener('click', close);

  saveBtn.addEventListener('click', () => {
    const newKey = keyInput.value.trim();
    const newProvider = providerSelect.value;
    const newModel = newProvider === 'gemini' ? modelSelect.value : customModelInput.value.trim();
    const newBaseUrl = baseUrlInput.value.trim();

    if (newKey) setApiKey(newKey);

    localStorage.setItem(CONFIG.STORAGE_KEY_PROVIDER, newProvider);
    localStorage.setItem(CONFIG.STORAGE_KEY_MODEL, newModel);
    localStorage.setItem(CONFIG.STORAGE_KEY_BASEURL, newBaseUrl);

    alert('Configuració desada correctament.');
    close();
    location.reload(); // Reload to ensure changes take effect cleanly
  });

  testBtn.addEventListener('click', async () => {
    const key = keyInput.value.trim();
    const provider = providerSelect.value;

    if (!key) {
      alert('Introdueix una clau primer.');
      return;
    }

    testBtn.textContent = '...';
    testBtn.disabled = true;

    try {
      const result = await testConnection(provider, key);
      if (result.ok) {
        let msg = '✅ Connexió correcta!';
        if (result.models && result.models.length > 0) {
          msg += `\n\nModels trobats amb la teva clau:\n- ${result.models.slice(0, 10).join('\n- ')}`;
          if (result.models.length > 10) msg += `\n...i ${result.models.length - 10} més.`;
        }
        alert(msg);
        testBtn.textContent = '✅';
      } else {
        let msg = `❌ Error: ${result.message}`;
        if (result.models && result.models.length > 0) {
          msg += `\n\nTot i l'error, s'han trobat aquests models:\n- ${result.models.join('\n- ')}`;
        }
        alert(msg);
        testBtn.textContent = '❌';
      }
    } catch (err) {
      alert(`Error: ${err.message}`);
      testBtn.textContent = '⚠️';
    }

    setTimeout(() => {
      testBtn.textContent = '⚡';
      testBtn.disabled = false;
    }, 3000);
  });

  toggleVisBtn.addEventListener('click', () => {
    keyInput.type = keyInput.type === 'password' ? 'text' : 'password';
  });

  const updateModelList = () => {
    const provider = providerSelect.value;
    // Temporarily set provider in CONFIG so getAvailableModels returns the right list
    const oldProvider = CONFIG.PROVIDER;
    CONFIG.PROVIDER = provider;
    const models = getAvailableModels();
    CONFIG.PROVIDER = oldProvider; // Restore

    modelSelect.innerHTML = models.map(m => `
            <option value="${m.id}" ${m.id === currentModel ? 'selected' : ''}>
                ${m.name} ${m.id !== 'custom' ? `(${m.id})` : ''}
            </option>
        `).join('');

    const isGemini = provider === 'gemini';
    baseUrlGroup.style.display = isGemini ? 'none' : 'block';

    // Show custom input if provider is not gemini AND model is custom
    const isCustom = modelSelect.value === 'custom' || !isGemini;
    customModelInput.style.display = isCustom ? 'block' : 'none';

    modelHint.textContent = isGemini
      ? 'Si tens errors de "Quota", prova un model Flash.'
      : 'Pots triar un preset o escriure el nom del model d\'OpenRouter.';
  };

  providerSelect.addEventListener('change', updateModelList);

  modelSelect.addEventListener('change', () => {
    const isGemini = providerSelect.value === 'gemini';
    customModelInput.style.display = (modelSelect.value === 'custom' || !isGemini) ? 'block' : 'none';
  });

  // Initialize state
  updateModelList();
}
