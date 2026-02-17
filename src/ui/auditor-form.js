// CREACTIVITAT — Auditor Form UI (Audit Mode)

export function renderAuditorForm(container, onSubmit) {
  container.innerHTML = `
    <div class="unified-form">
      <div class="form-header">
        <h2 class="form-title">Audita i Millora</h2>
        <p class="form-subtitle">L'IA del Studio t'ajudarà a optimitzar la teva proposta pedagògica.</p>
      </div>
      
      <div class="form-grid-compact">
        <div class="form-section" style="grid-column: 1 / -1;">
          <h3 class="section-title"><i data-lucide="file-edit"></i> Activitat a Auditar</h3>
          <div class="form-group">
            <label class="form-label">Descripció detallada</label>
            <textarea id="audit-text" class="form-textarea" placeholder="Explica què fan els alumnes, quin paper té la IA, etc."></textarea>
          </div>
        </div>

        <div class="form-section">
          <h3 class="section-title"><i data-lucide="graduation-cap"></i> Context</h3>
          <div class="form-group">
            <label class="form-label" for="audit-stage">Etapa educativa</label>
            <select id="audit-stage" class="form-select">
              <option value="">No especificada</option>
              <option value="primaria_cs">Primària CS (10-12)</option>
              <option value="eso1">ESO 1r cicle (12-14)</option>
              <option value="eso2">ESO 2n cicle (14-16)</option>
              <option value="batxillerat">Batxillerat (16-18)</option>
              <option value="fp">FP</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label" for="audit-subject">Matèria</label>
            <input type="text" id="audit-subject" class="form-input" placeholder="Ex: Matemàtiques..." />
          </div>
        </div>

        <div class="form-section">
          <h3 class="section-title"><i data-lucide="shield"></i> Enfocament</h3>
          <p style="font-size: 11px; color: var(--c-text-muted); line-height: 1.4;">L'auditoria buscarà equilibrar la <strong>Fricció Productiva</strong> i evitar la rendició cognitiva mitjançant marcs ètics.</p>
        </div>
      </div>
      
      <div class="form-footer" style="text-align: center; margin-top: var(--sp-6);">
        <button class="btn btn-primary btn-lg" id="audit-submit">
          <i data-lucide="shield-check"></i>
          Audita i Millora
        </button>
      </div>
    </div>
  `;

  if (window.lucide) window.lucide.createIcons();

  const submitBtn = container.querySelector('#audit-submit');
  submitBtn.addEventListener('click', () => {
    const activityText = container.querySelector('#audit-text').value.trim();
    if (!activityText) {
      alert('Escriu o enganxa la descripció de l\'activitat per auditar.');
      return;
    }

    const params = {
      activityText,
      stage: container.querySelector('#audit-stage').value,
      subject: container.querySelector('#audit-subject').value,
    };

    onSubmit(params);
  });
}
