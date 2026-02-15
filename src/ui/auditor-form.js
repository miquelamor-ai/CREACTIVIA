// CREACTIVITAT — Auditor Form UI (Audit Mode)

export function renderAuditorForm(container, onSubmit) {
    container.innerHTML = `
    <div class="auditor-form">
      <h2 class="wizard-title">🔍 Audita una activitat</h2>
      <p class="wizard-subtitle">
        Enganxa la descripció d'una activitat existent amb IA i obtindràs una anàlisi pedagògica completa:
        semàfor de fricció, riscos, propostes de millora.
      </p>
      
      <div class="form-group">
        <label class="form-label" for="audit-text">Descripció de l'activitat</label>
        <textarea id="audit-text" class="form-textarea" style="min-height: 240px;" placeholder="Enganxa aquí la descripció de l'activitat. Com més detall proporcionis, millor serà l'auditoria.

Exemple:
Els alumnes de 3r d'ESO de Llengua Catalana han d'escriure un text argumentatiu. Se'ls demana que usin ChatGPT per generar un primer esborrany i després el modifiquin amb les seves pròpies idees..."></textarea>
      </div>
      
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--sp-4);">
        <div class="form-group">
          <label class="form-label" for="audit-stage">Etapa educativa (opcional)</label>
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
          <label class="form-label" for="audit-subject">Matèria (opcional)</label>
          <input type="text" id="audit-subject" class="form-input" placeholder="Ex: Matemàtiques..." />
        </div>
      </div>
      
      <div style="display: flex; justify-content: flex-end; margin-top: var(--sp-4);">
        <button class="btn btn-primary btn-lg" id="audit-submit">🔍 Audita</button>
      </div>
    </div>
  `;

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
