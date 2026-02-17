// CREACTIVITAT — Generator Form (One-screen, compact)

const STAGES = [
  { value: 'primaria_cs', label: 'Primària CS', sub: '10-12' },
  { value: 'eso1', label: 'ESO 1r cicle', sub: '12-14' },
  { value: 'eso2', label: 'ESO 2n cicle', sub: '14-16' },
  { value: 'batxillerat', label: 'Batxillerat', sub: '16-18' },
  { value: 'fp', label: 'FP', sub: 'Prof.' },
];

const GRANULARITIES = [
  { value: 'exercici', icon: 'file-text', label: 'Exercici', sub: '5-20 min' },
  { value: 'activitat', icon: 'clipboard-list', label: 'Activitat', sub: '1 sessió' },
  { value: 'tasca', icon: 'book', label: 'Tasca', sub: '2-5 sessions' },
  { value: 'projecte', icon: 'rocket', label: 'Projecte', sub: '1-4 set.' },
];

const MIHIA_LEVELS = [
  { value: '', label: 'Auto' },
  { value: '1', label: 'N1 · Explora' },
  { value: '2', label: 'N2 · Revisa' },
  { value: '3', label: 'N3 · Cocrea' },
  { value: '4', label: 'N4 · Delega' },
];

const ROLES = [
  { value: '', label: 'Auto' },
  { value: 'mentor_socratic', label: '🧠 Mentor' },
  { value: 'critic_editor', label: '✍️ Crític' },
  { value: 'generador_casos', label: '🧪 Casos' },
  { value: 'simulador', label: '🎭 Sim.' },
  { value: 'contrincant', label: '⚔️ Debat' },
  { value: 'teachable_agent', label: '🎓 Agent' },
];

const DRAFT_KEY = 'creactivitat_draft_v2';

function loadDraft() {
  try {
    const d = localStorage.getItem(DRAFT_KEY);
    if (!d) return null;
    const { data, ts } = JSON.parse(d);
    if (Date.now() - ts > 24 * 3600 * 1000) { localStorage.removeItem(DRAFT_KEY); return null; }
    return data;
  } catch { return null; }
}

function saveDraft(data) {
  try { localStorage.setItem(DRAFT_KEY, JSON.stringify({ data, ts: Date.now() })); } catch { }
}

let formData = loadDraft() || {
  granularity: 'activitat', stage: '', subject: '', topic: '',
  objective: '', duration: '1 sessió', mihiaPreferred: '', rolePreferred: '',
};

export function renderGeneratorForm(container, onSubmit) {
  container.innerHTML = `
    <div class="gen-form">
      <div class="gen-form-header">
        <h2 class="gen-form-title">
          <i data-lucide="sparkles"></i>
          Nova Proposta Pedagògica
        </h2>
        <p class="gen-form-subtitle">Dissenya una activitat amb IA auditada automàticament</p>
      </div>

      <div class="gen-form-body">

        <!-- Granularitat -->
        <div class="form-group">
          <label class="form-label">Tipus de proposta</label>
          <div class="chip-grid">
            ${GRANULARITIES.map(g => `
              <button type="button" class="chip ${formData.granularity === g.value ? 'chip-active' : ''}"
                data-field="granularity" data-value="${g.value}">
                <i data-lucide="${g.icon}" class="chip-icon"></i>
                <span class="chip-label">${g.label}</span>
                <span class="chip-sub">${g.sub}</span>
              </button>
            `).join('')}
          </div>
        </div>

        <!-- Etapa + Matèria + Durada inline -->
        <div class="form-row-3">
          <div class="form-group">
            <label class="form-label req" for="f-stage">Etapa</label>
            <select id="f-stage" class="form-select">
              <option value="">Tria...</option>
              ${STAGES.map(s => `
                <option value="${s.value}" ${formData.stage === s.value ? 'selected' : ''}>
                  ${s.label} (${s.sub})
                </option>`).join('')}
            </select>
          </div>
          <div class="form-group">
            <label class="form-label req" for="f-subject">Matèria</label>
            <input type="text" id="f-subject" class="form-input" 
              value="${esc(formData.subject)}" placeholder="Matemàtiques..." />
          </div>
          <div class="form-group">
            <label class="form-label" for="f-duration">Durada</label>
            <input type="text" id="f-duration" class="form-input" 
              value="${esc(formData.duration)}" placeholder="1 sessió" />
          </div>
        </div>

        <!-- Tema -->
        <div class="form-group">
          <label class="form-label req" for="f-topic">Tema o contingut</label>
          <input type="text" id="f-topic" class="form-input" 
            value="${esc(formData.topic)}" placeholder="Ex: Equacions de 1r grau, la fotosíntesi, la Revolució Francesa..." />
        </div>

        <!-- Objectiu -->
        <div class="form-group">
          <label class="form-label req" for="f-objective">
            Objectiu d'aprenentatge
            <span class="form-label-hint">Sigues concret/a</span>
          </label>
          <textarea id="f-objective" class="form-textarea" rows="3"
            placeholder="Què ha d'aprendre o ser capaç de fer l'alumne al final d'aquesta activitat?">${esc(formData.objective)}</textarea>
        </div>

        <!-- IA Config (col·lapsible) -->
        <details class="ia-config" ${formData.mihiaPreferred || formData.rolePreferred ? 'open' : ''}>
          <summary class="ia-config-summary">
            <i data-lucide="bot"></i>
            Configuració IA avançada
            <span class="ia-config-hint">Opcional · el sistema tria automàticament</span>
          </summary>
          <div class="ia-config-body">
            <div class="form-row-2">
              <div class="form-group">
                <label class="form-label">Nivell MIHIA</label>
                <div class="pill-group">
                  ${MIHIA_LEVELS.map(m => `
                    <button type="button" class="pill ${formData.mihiaPreferred === m.value ? 'pill-active' : ''}"
                      data-field="mihiaPreferred" data-value="${m.value}">${m.label}</button>
                  `).join('')}
                </div>
              </div>
              <div class="form-group">
                <label class="form-label">Rol de la IA</label>
                <div class="pill-group">
                  ${ROLES.map(r => `
                    <button type="button" class="pill ${formData.rolePreferred === r.value ? 'pill-active' : ''}"
                      data-field="rolePreferred" data-value="${r.value}">${r.label}</button>
                  `).join('')}
                </div>
              </div>
            </div>
          </div>
        </details>

        <!-- Submit -->
        <div class="gen-form-footer">
          <div class="gen-form-info">
            <i data-lucide="info"></i>
            <span>2 crides al model · Activitat + Auditoria pedagògica</span>
          </div>
          <div class="gen-form-actions">
            <button type="button" class="btn btn-ghost btn-sm" id="btn-clear-draft">
              <i data-lucide="rotate-ccw"></i> Reinicia
            </button>
            <button type="button" class="btn btn-primary btn-lg" id="btn-generate">
              <i data-lucide="sparkles"></i>
              Genera proposta
            </button>
          </div>
        </div>

      </div>
    </div>
  `;

  if (window.lucide) window.lucide.createIcons();
  attachFormEvents(container, onSubmit);
}

function attachFormEvents(container, onSubmit) {
  // Chips (granularitat)
  container.querySelectorAll('.chip').forEach(chip => {
    chip.addEventListener('click', () => {
      container.querySelectorAll('.chip').forEach(c => c.classList.remove('chip-active'));
      chip.classList.add('chip-active');
      formData.granularity = chip.dataset.value;
      saveDraft(formData);
    });
  });

  // Pills (MIHIA i roles)
  container.querySelectorAll('.pill').forEach(pill => {
    pill.addEventListener('click', () => {
      const field = pill.dataset.field;
      pill.closest('.pill-group').querySelectorAll('.pill').forEach(p => p.classList.remove('pill-active'));
      pill.classList.add('pill-active');
      formData[field] = pill.dataset.value;
      saveDraft(formData);
    });
  });

  // Auto-save en escriure
  ['f-stage', 'f-subject', 'f-duration', 'f-topic', 'f-objective'].forEach(id => {
    const el = container.querySelector(`#${id}`);
    if (!el) return;
    el.addEventListener('input', () => {
      syncFields(container);
      saveDraft(formData);
    });
  });

  // Reinicia
  container.querySelector('#btn-clear-draft')?.addEventListener('click', () => {
    if (!confirm('Vols reiniciar el formulari?')) return;
    formData = { granularity: 'activitat', stage: '', subject: '', topic: '', objective: '', duration: '1 sessió', mihiaPreferred: '', rolePreferred: '' };
    localStorage.removeItem(DRAFT_KEY);
    renderGeneratorForm(container, onSubmit);
  });

  // Genera
  container.querySelector('#btn-generate')?.addEventListener('click', () => {
    syncFields(container);

    const missing = [];
    if (!formData.stage) missing.push('Etapa');
    if (!formData.subject) missing.push('Matèria');
    if (!formData.topic) missing.push('Tema');
    if (!formData.objective) missing.push('Objectiu');

    if (missing.length) {
      showFormError(container, `Cal omplir: ${missing.join(', ')}`);
      return;
    }

    clearFormError(container);
    onSubmit({ ...formData });
  });
}

function syncFields(container) {
  formData.stage = container.querySelector('#f-stage')?.value || '';
  formData.subject = container.querySelector('#f-subject')?.value || '';
  formData.duration = container.querySelector('#f-duration')?.value || '';
  formData.topic = container.querySelector('#f-topic')?.value || '';
  formData.objective = container.querySelector('#f-objective')?.value || '';
}

function showFormError(container, msg) {
  let err = container.querySelector('.form-error-banner');
  if (!err) {
    err = document.createElement('div');
    err.className = 'form-error-banner';
    container.querySelector('.gen-form-footer').prepend(err);
  }
  err.innerHTML = `<i data-lucide="alert-triangle"></i> ${msg}`;
  if (window.lucide) window.lucide.createIcons();
  err.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function clearFormError(container) {
  container.querySelector('.form-error-banner')?.remove();
}

function esc(s) {
  if (!s) return '';
  return s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
