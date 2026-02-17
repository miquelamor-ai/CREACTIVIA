// CREACTIVITAT — Unified Generator Form UI

const STAGES = [
  { value: 'primaria_cs', label: 'Primària CS (10-12)' },
  { value: 'eso1', label: 'ESO 1r cicle (12-14)' },
  { value: 'eso2', label: 'ESO 2n cicle (14-16)' },
  { value: 'batxillerat', label: 'Batxillerat (16-18)' },
  { value: 'fp', label: 'FP' },
];

const GRANULARITIES = [
  { value: 'exercici', icon: 'file-text', label: 'Exercici', desc: '5-20 min' },
  { value: 'activitat', icon: 'clipboard-list', label: 'Activitat', desc: '1 sessió' },
  { value: 'tasca', icon: 'book', label: 'Tasca', desc: '2-5 sessions' },
  { value: 'projecte', icon: 'rocket', label: 'Projecte', desc: '1-4 setmanes' },
];

const MIHIA_LEVELS = [
  { value: '', label: 'Automàtic' },
  { value: '0', label: 'N0 — No delegació' },
  { value: '1', label: 'N1 — Exploració' },
  { value: '2', label: 'N2 — Suport' },
  { value: '3', label: 'N3 — Cocreació' },
  { value: '4', label: 'N4 — Delegació' },
  { value: '5', label: 'N5 — Autònoma' },
];

const ROLES = [
  { value: '', label: 'Automàtic' },
  { value: 'mentor_socratic', label: '🧠 Mentor Socràtic' },
  { value: 'critic_editor', label: '✍️ Crític / Editor' },
  { value: 'generador_casos', label: '🧪 Generador Casos' },
  { value: 'simulador', label: '🎭 Simulador' },
  { value: 'contrincant', label: '⚔️ Contrincant' },
  { value: 'traductor', label: '🔄 Traductor' },
  { value: 'teachable_agent', label: '🎓 Teachable Agent' },
];

let formData = {
  granularity: 'activitat',
  duration: '1 sessió',
  stage: '',
  subject: '',
  topic: '',
  objective: '',
  mihiaPreferred: '',
  rolePreferred: '',
};

export function renderGeneratorForm(container, onSubmit) {
  function render() {
    container.innerHTML = `
      <div class="unified-form">
        <div class="form-header">
          <h2 class="form-title">Proposta Pedagògica</h2>
          <p class="form-subtitle">Dissenya la teva activitat amb el rigor del Studio Creactivitat.</p>
        </div>

        <div class="form-grid-compact">
          <!-- Section 1: Context & Type -->
          <div class="form-section">
            <h3 class="section-title"><i data-lucide="package"></i> Tipus i Context</h3>
            
            <div class="form-group">
              <label class="form-label">Granularitat</label>
              <div class="options-grid">
                ${GRANULARITIES.map(g => `
                  <div class="option-chip ${formData.granularity === g.value ? 'selected' : ''}" data-field="granularity" data-value="${g.value}">
                    <i data-lucide="${g.icon}"></i>
                    <span class="chip-label">${g.label}</span>
                  </div>
                `).join('')}
              </div>
            </div>

            <div class="form-group">
              <label class="form-label" for="stage">Etapa</label>
              <select id="stage" class="form-select">
                <option value="">Selecciona etapa...</option>
                ${STAGES.map(s => `<option value="${s.value}" ${formData.stage === s.value ? 'selected' : ''}>${s.label}</option>`).join('')}
              </select>
            </div>

            <div class="form-group">
              <label class="form-label" for="duration">Durada</label>
              <input type="text" id="duration" class="form-input" value="${formData.duration}" placeholder="Ex: 1 sessió" />
            </div>
          </div>

          <!-- Section 2: Topic & Objective -->
          <div class="form-section">
            <h3 class="section-title"><i data-lucide="book-open"></i> Contingut</h3>
            
            <div class="form-group">
              <label class="form-label" for="subject">Matèria</label>
              <input type="text" id="subject" class="form-input" value="${formData.subject}" placeholder="Ex: Matemàtiques..." />
            </div>

            <div class="form-group">
              <label class="form-label" for="topic">Tema</label>
              <input type="text" id="topic" class="form-input" value="${formData.topic}" placeholder="Ex: La fotosíntesi..." />
            </div>

            <div class="form-group" style="flex: 1; display: flex; flex-direction: column;">
              <label class="form-label" for="objective">Objectiu d'aprenentatge</label>
              <textarea id="objective" class="form-textarea" style="flex: 1; min-height: 120px;" placeholder="Què ha d'aprendre l'alumne?">${formData.objective}</textarea>
            </div>
          </div>

          <!-- Section 3: IA Configuration -->
          <div class="form-section">
            <h3 class="section-title"><i data-lucide="bot"></i> IA Config</h3>
            <div class="form-group">
              <label class="form-label" for="mihia">Nivell MIHIA</label>
              <select id="mihia" class="form-select">
                ${MIHIA_LEVELS.map(m => `<option value="${m.value}" ${formData.mihiaPreferred === m.value ? 'selected' : ''}>${m.label}</option>`).join('')}
              </select>
            </div>
            <div class="form-group">
              <label class="form-label" for="role">Rol IA</label>
              <select id="role" class="form-select">
                ${ROLES.map(r => `<option value="${r.value}" ${formData.rolePreferred === r.value ? 'selected' : ''}>${r.label}</option>`).join('')}
              </select>
            </div>
            <div class="form-group" style="margin-top: auto; padding: var(--sp-4); background: var(--c-primary-light); border-radius: var(--r-md); border: 1px solid var(--c-primary);">
              <p style="font-size: 11px; color: var(--c-primary); line-height: 1.4; font-weight: 600;">
                <i data-lucide="info" style="width: 12px; height: 12px; vertical-align: middle;"></i>
                El motor seleccionarà el nivell i rol més adient segons l'objectiu si els deixes en automàtic.
              </p>
            </div>
          </div>
        </div>

        <div style="text-align: center; margin-top: var(--sp-6);">
          <button class="btn btn-primary btn-lg" id="form-submit" style="min-width: 320px;">
            <i data-lucide="sparkles"></i>
            Genera Proposta Pedagògica
          </button>
        </div>
      </div>
    `;
    attachEvents(container, onSubmit);
    if (window.lucide) window.lucide.createIcons();
  }

  render();
}

function attachEvents(container, onSubmit) {
  // Option chips
  container.querySelectorAll('.option-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      formData.granularity = chip.dataset.value;
      renderGeneratorForm(container, onSubmit);
    });
  });

  // Submit
  container.querySelector('#form-submit').addEventListener('click', () => {
    // Sync fields
    formData.stage = container.querySelector('#stage').value;
    formData.duration = container.querySelector('#duration').value;
    formData.subject = container.querySelector('#subject').value;
    formData.topic = container.querySelector('#topic').value;
    formData.objective = container.querySelector('#objective').value;
    formData.mihiaPreferred = container.querySelector('#mihia').value;
    formData.rolePreferred = container.querySelector('#role').value;

    onSubmit(formData);
  });
}
