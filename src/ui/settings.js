// CREACTIVITAT — Settings UI

import { CONFIG, getApiKey, setApiKey, getModel, setModel, getAvailableModels } from '../config.js';

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
          
          <!-- API Key Section -->
          <div class="form-group">
            <label class="form-label">Google Gemini API Key</label>
            <div style="display: flex; gap: var(--sp-2);">
              <input type="password" id="settings-api-key" class="form-input" value="${apiKey}" placeholder="Enganxa la teva clau API aquí" />
              <button class="btn btn-ghost" id="toggle-key-vis">👁️</button>
            </div>
            <p class="form-hint">Es guarda localment al navegador.</p>
          </div>

          <!-- Model Section -->
          <div class="form-group">
            <label class="form-label">Model IA</label>
            <select id="settings-model" class="form-select">
              ${models.map(m => `
                <option value="${m.id}" ${m.id === currentModel ? 'selected' : ''}>
                  ${m.name} (${m.id})
                </option>
              `).join('')}
            </select>
            <p class="form-hint">Si tens errors de "Quota" o "404", prova de canviar el model.</p>
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

    const close = () => {
        container.innerHTML = '';
        if (onClose) onClose();
    };

    closeBtn.addEventListener('click', close);
    cancelBtn.addEventListener('click', close);

    saveBtn.addEventListener('click', () => {
        const newKey = keyInput.value.trim();
        const newModel = modelSelect.value;

        if (newKey) setApiKey(newKey);
        setModel(newModel);

        alert('Configuració desada correctament.');
        close();
        location.reload(); // Reload to ensure changes take effect cleanly
    });

    toggleVisBtn.addEventListener('click', () => {
        keyInput.type = keyInput.type === 'password' ? 'text' : 'password';
    });
}
