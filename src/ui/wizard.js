// CREACTIVITAT — Wizard UI (Generate Mode)

const STAGES = [
    { value: 'primaria_cs', label: 'Primària CS (10-12)' },
    { value: 'eso1', label: 'ESO 1r cicle (12-14)' },
    { value: 'eso2', label: 'ESO 2n cicle (14-16)' },
    { value: 'batxillerat', label: 'Batxillerat (16-18)' },
    { value: 'fp', label: 'FP' },
];

const GRANULARITIES = [
    { value: 'exercici', icon: '📝', label: 'Exercici', desc: '5-20 min, objectiu únic' },
    { value: 'activitat', icon: '📋', label: 'Activitat', desc: '1 sessió (45-60 min)' },
    { value: 'tasca', icon: '📚', label: 'Tasca', desc: '2-5 sessions' },
    { value: 'projecte', icon: '🚀', label: 'Projecte', desc: '1-4 setmanes' },
];

const MIHIA_LEVELS = [
    { value: '', label: 'Automàtic (l\'app decideix)' },
    { value: '0', label: 'Nivell 0 — No delegació' },
    { value: '1', label: 'Nivell 1 — Exploració' },
    { value: '2', label: 'Nivell 2 — Suport / Revisió' },
    { value: '3', label: 'Nivell 3 — Cocreació' },
    { value: '4', label: 'Nivell 4 — Delegació supervisada' },
    { value: '5', label: 'Nivell 5 — Agència autònoma' },
];

const ROLES = [
    { value: '', label: 'Automàtic (l\'app decideix)' },
    { value: 'mentor_socratic', label: '🧠 Mentor Socràtic' },
    { value: 'critic_editor', label: '✍️ Crític / Editor' },
    { value: 'generador_casos', label: '🧪 Generador de Casos' },
    { value: 'simulador', label: '🎭 Simulador' },
    { value: 'contrincant', label: '⚔️ Contrincant' },
    { value: 'traductor', label: '🔄 Traductor / Adaptador' },
    { value: 'teachable_agent', label: '🎓 Teachable Agent' },
];

const STEPS = [
    { num: 1, label: 'Tipus' },
    { num: 2, label: 'Context' },
    { num: 3, label: 'IA' },
    { num: 4, label: 'Confirma' },
];

let currentStep = 1;
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

export function renderWizard(container, onSubmit) {
    function render() {
        container.innerHTML = `
      <div class="wizard">
        ${renderStepper()}
        ${renderCurrentPanel()}
        ${renderActions()}
      </div>
    `;
        attachEvents(container, onSubmit);
    }

    render();
    return { render, getFormData: () => ({ ...formData }) };
}

function renderStepper() {
    return `
    <div class="wizard-stepper">
      ${STEPS.map((step, i) => {
        const status = step.num < currentStep ? 'completed' : step.num === currentStep ? 'active' : '';
        const connector = i < STEPS.length - 1 ? '<div class="wizard-step-connector"></div>' : '';
        return `
          <div class="wizard-step ${status}">
            <span class="wizard-step-num">${step.num < currentStep ? '✓' : step.num}</span>
            <span>${step.label}</span>
          </div>
          ${connector}
        `;
    }).join('')}
    </div>
  `;
}

function renderCurrentPanel() {
    switch (currentStep) {
        case 1: return renderStep1();
        case 2: return renderStep2();
        case 3: return renderStep3();
        case 4: return renderStep4();
        default: return '';
    }
}

function renderStep1() {
    return `
    <div class="wizard-panel">
      <h2 class="wizard-title">Quin tipus de proposta vols?</h2>
      <p class="wizard-subtitle">Tria la granularitat i la durada de la proposta didàctica.</p>
      
      <div class="form-group">
        <label class="form-label">Granularitat</label>
        <div class="option-cards">
          ${GRANULARITIES.map(g => `
            <div class="option-card ${formData.granularity === g.value ? 'selected' : ''}" data-field="granularity" data-value="${g.value}">
              <span class="option-card-icon">${g.icon}</span>
              <div class="option-card-title">${g.label}</div>
              <div class="option-card-desc">${g.desc}</div>
            </div>
          `).join('')}
        </div>
      </div>
      
      <div class="form-group">
        <label class="form-label" for="duration">Durada estimada</label>
        <input type="text" id="duration" class="form-input" value="${formData.duration}" placeholder="Ex: 1 sessió, 3 sessions, 2 setmanes..." />
        <p class="form-hint">Indica el nombre de sessions o setmanes</p>
      </div>
    </div>
  `;
}

function renderStep2() {
    return `
    <div class="wizard-panel">
      <h2 class="wizard-title">Context de l'activitat</h2>
      <p class="wizard-subtitle">Proporciona la informació sobre l'alumnat, matèria i contingut.</p>
      
      <div class="form-group">
        <label class="form-label" for="stage">Etapa educativa</label>
        <select id="stage" class="form-select">
          <option value="">Selecciona...</option>
          ${STAGES.map(s => `<option value="${s.value}" ${formData.stage === s.value ? 'selected' : ''}>${s.label}</option>`).join('')}
        </select>
      </div>
      
      <div class="form-group">
        <label class="form-label" for="subject">Matèria / Àrea</label>
        <input type="text" id="subject" class="form-input" value="${formData.subject}" placeholder="Ex: Llengua Catalana, Matemàtiques, Ciències Socials..." />
      </div>
      
      <div class="form-group">
        <label class="form-label" for="topic">Tema / Contingut</label>
        <input type="text" id="topic" class="form-input" value="${formData.topic}" placeholder="Ex: El text argumentatiu, Equacions de 2n grau..." />
      </div>
      
      <div class="form-group">
        <label class="form-label" for="objective">Objectiu d'aprenentatge</label>
        <textarea id="objective" class="form-textarea" placeholder="Què ha d'aprendre l'alumne amb aquesta activitat? Sigues específic/a.">${formData.objective}</textarea>
        <p class="form-hint">Un objectiu clar millora molt la qualitat de la proposta</p>
      </div>
    </div>
  `;
}

function renderStep3() {
    return `
    <div class="wizard-panel">
      <h2 class="wizard-title">Configuració de la IA</h2>
      <p class="wizard-subtitle">Opcions avançades. Pots deixar-les en automàtic si prefereixes que l'app decideixi.</p>
      
      <div class="form-group">
        <label class="form-label" for="mihia">Nivell MIHIA d'interacció</label>
        <select id="mihia" class="form-select">
          ${MIHIA_LEVELS.map(m => `<option value="${m.value}" ${formData.mihiaPreferred === m.value ? 'selected' : ''}>${m.label}</option>`).join('')}
        </select>
        <p class="form-hint">El nivell d'interacció humà-IA desitjat (0 = sense IA, 5 = IA autònoma)</p>
      </div>
      
      <div class="form-group">
        <label class="form-label" for="role">Rol de la IA</label>
        <select id="role" class="form-select">
          ${ROLES.map(r => `<option value="${r.value}" ${formData.rolePreferred === r.value ? 'selected' : ''}>${r.label}</option>`).join('')}
        </select>
        <p class="form-hint">Quin paper vols que faci la IA en l'activitat</p>
      </div>
    </div>
  `;
}

function renderStep4() {
    const granLabel = GRANULARITIES.find(g => g.value === formData.granularity)?.label || formData.granularity;
    const stageLabel = STAGES.find(s => s.value === formData.stage)?.label || formData.stage || 'No seleccionada';

    return `
    <div class="wizard-panel">
      <h2 class="wizard-title">Confirma i genera</h2>
      <p class="wizard-subtitle">Revisa els paràmetres abans de generar la proposta.</p>
      
      <div style="background: var(--c-surface-2); border-radius: var(--r-md); padding: var(--sp-5); margin-bottom: var(--sp-4);">
        <div style="display: grid; grid-template-columns: auto 1fr; gap: var(--sp-2) var(--sp-6); font-size: var(--fs-sm);">
          <span style="color: var(--c-text-muted); font-weight: 500;">Tipus:</span>
          <span>${granLabel}</span>
          <span style="color: var(--c-text-muted); font-weight: 500;">Durada:</span>
          <span>${formData.duration || 'No especificada'}</span>
          <span style="color: var(--c-text-muted); font-weight: 500;">Etapa:</span>
          <span>${stageLabel}</span>
          <span style="color: var(--c-text-muted); font-weight: 500;">Matèria:</span>
          <span>${formData.subject || 'No especificada'}</span>
          <span style="color: var(--c-text-muted); font-weight: 500;">Tema:</span>
          <span>${formData.topic || 'No especificat'}</span>
          <span style="color: var(--c-text-muted); font-weight: 500;">Objectiu:</span>
          <span>${formData.objective || 'No especificat'}</span>
        </div>
      </div>
    </div>
  `;
}

function renderActions() {
    return `
    <div class="wizard-actions">
      ${currentStep > 1
            ? '<button class="btn btn-ghost" id="wizard-prev">← Anterior</button>'
            : '<div></div>'}
      ${currentStep < 4
            ? '<button class="btn btn-primary" id="wizard-next">Següent →</button>'
            : '<button class="btn btn-primary btn-lg" id="wizard-submit">🎯 Genera proposta</button>'}
    </div>
  `;
}

function attachEvents(container, onSubmit) {
    // Option cards
    container.querySelectorAll('.option-card').forEach(card => {
        card.addEventListener('click', () => {
            const field = card.dataset.field;
            const value = card.dataset.value;
            formData[field] = value;
            // Re-render to update selection
            container.querySelector('.wizard').innerHTML = renderStepper() + renderCurrentPanel() + renderActions();
            attachEvents(container, onSubmit);
        });
    });

    // Navigation
    const prevBtn = container.querySelector('#wizard-prev');
    const nextBtn = container.querySelector('#wizard-next');
    const submitBtn = container.querySelector('#wizard-submit');

    if (prevBtn) prevBtn.addEventListener('click', () => { saveCurrentFields(container); currentStep--; render(); });
    if (nextBtn) nextBtn.addEventListener('click', () => { saveCurrentFields(container); currentStep++; render(); });
    if (submitBtn) submitBtn.addEventListener('click', () => { saveCurrentFields(container); onSubmit(formData); });

    function render() {
        container.querySelector('.wizard').innerHTML = renderStepper() + renderCurrentPanel() + renderActions();
        attachEvents(container, onSubmit);
    }
}

function saveCurrentFields(container) {
    const fields = {
        duration: '#duration',
        stage: '#stage',
        subject: '#subject',
        topic: '#topic',
        objective: '#objective',
        mihiaPreferred: '#mihia',
        rolePreferred: '#role',
    };

    Object.entries(fields).forEach(([key, selector]) => {
        const el = container.querySelector(selector);
        if (el) formData[key] = el.value;
    });
}
