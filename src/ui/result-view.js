// CREACTIVITAT — Result View UI

export function renderResult(container, result, onBack) {
  const { mode, activity, audit, error } = result;

  if (error) {
    container.innerHTML = `
        <div class="result-header">
          <button class="result-back" id="result-back" title="Torna">←</button>
          <h2 class="result-title" style="color: var(--c-danger)">⚠️ Error</h2>
        </div>
        
        <div class="result-content">
          <div style="padding: var(--sp-6); background: var(--c-red-bg); border-radius: var(--r-md); border: 1px solid var(--c-danger);">
            <p style="font-weight: 600; font-size: var(--fs-lg); margin-bottom: var(--sp-2);">Hi ha hagut un problema</p>
            <p>${error}</p>
            ${error.includes('429') ? `
              <div style="margin-top: var(--sp-4); padding-top: var(--sp-4); border-top: 1px solid rgba(239, 68, 68, 0.2);">
                <p style="font-weight: 600; margin-bottom: var(--sp-2);">💡 Consell de quota:</p>
                <ul style="margin-left: var(--sp-4); font-size: var(--fs-sm);">
                  <li>Estàs utilitzant la quota gratuïta. Espera un minut.</li>
                  <li>Prova de canviar al model <strong>Gemini 1.5 Flash</strong> a la configuració (⚙️), ja que té límits més alts.</li>
                </ul>
              </div>
            ` : ''}
          </div>
        </div>
      `;
    container.querySelector('#result-back').addEventListener('click', onBack);
    return;
  }

  container.innerHTML = `
    <div class="result-header">
      <div style="display: flex; align-items: center; gap: var(--sp-4);">
        <button class="result-back" id="result-back" title="Torna">←</button>
        <h2 class="result-title">${mode === 'generate' ? activity?.titol || 'Proposta generada' : '🔍 Auditoria pedagògica'}</h2>
      </div>
      <div class="result-actions">
        <button class="btn btn-secondary btn-sm" id="btn-copy" title="Copia al porta-retalls">📋 Copia</button>
        <button class="btn btn-secondary btn-sm" id="btn-download" title="Descarrega JSON">⬇️ JSON</button>
      </div>
    </div>
    
    ${mode === 'generate' && activity ? renderActivityResult(activity) : ''}
    ${audit ? renderAuditResult(audit, mode) : ''}
  `;

  container.querySelector('#result-back').addEventListener('click', onBack);

  // Export Handlers
  const copyBtn = container.querySelector('#btn-copy');
  const dlBtn = container.querySelector('#btn-download');

  if (copyBtn) {
    copyBtn.addEventListener('click', () => {
      const text = JSON.stringify(result, null, 2);
      navigator.clipboard.writeText(text).then(() => alert('Copiat al porta-retalls!'));
    });
  }

  if (dlBtn) {
    dlBtn.addEventListener('click', () => {
      const text = JSON.stringify(result, null, 2);
      const blob = new Blob([text], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `creactivitat-${mode}-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
    });
  }

  // Accordion toggles
  container.querySelectorAll('.accordion-header').forEach(header => {
    header.addEventListener('click', () => {
      header.closest('.accordion').classList.toggle('open');
    });
  });
}

function renderActivityResult(act) {
  return `
    ${act.resum ? `<p style="color: var(--c-text-secondary); margin-bottom: var(--sp-6); font-size: var(--fs-base); line-height: 1.7;">${act.resum}</p>` : ''}
    
    <!-- Badges -->
    <div class="badges">
      ${act.granularitat ? `<span class="badge badge-primary">📐 ${act.granularitat}</span>` : ''}
      ${act.durada ? `<span class="badge">⏱ ${act.durada}</span>` : ''}
      ${act.etapa ? `<span class="badge">🎓 ${act.etapa}</span>` : ''}
      ${act.materia ? `<span class="badge">📖 ${act.materia}</span>` : ''}
      ${act.mihia ? `<span class="badge badge-accent">MIHIA ${act.mihia.nivell}</span>` : ''}
      ${act.rolIA ? `<span class="badge badge-success">${act.rolIA.principal}</span>` : ''}
      ${renderCompetencies4DBadges(act.competencies4D)}
    </div>
    
    <!-- Semaphore -->
    ${act.sempieza ? renderSemaphore(act.sempieza) : ''}
    
    <!-- Didactic Sequence -->
    ${act.sequencia ? renderSequence(act.sequencia) : ''}
    
    <!-- Details Accordions -->
    ${act.mihia ? renderAccordion('📊 Nivell MIHIA', renderMIHIA(act.mihia)) : ''}
    ${act.rolIA ? renderAccordion('🎭 Rol de la IA', renderRole(act.rolIA)) : ''}
    ${act.competencies4D ? renderAccordion('🧭 Competències 4D', renderCompetencies4D(act.competencies4D)) : ''}
    ${act.grr ? renderAccordion('📈 Responsabilitat Gradual (GRR)', renderGRR(act.grr)) : ''}
    ${act.reflexio_ppi ? renderAccordion('🪞 Reflexió PPI', renderReflexio(act.reflexio_ppi)) : ''}
    ${act.inclusio ? renderAccordion('♿ Inclusió i DUA', renderInclusio(act.inclusio)) : ''}
    ${act.evidencia_aprenentatge ? renderAccordion('📝 Evidència d\'aprenentatge', `<p>${act.evidencia_aprenentatge}</p>`) : ''}
    ${act.recomanacions_docent ? renderAccordion('💡 Recomanacions per al docent', `<p>${act.recomanacions_docent}</p>`) : ''}
    ${act.riscos?.length ? renderAccordion('⚠️ Riscos a vigilar', `<ul>${act.riscos.map(r => `<li>${r}</li>`).join('')}</ul>`) : ''}
  `;
}

function renderAuditResult(audit, mode) {
  const sectionTitle = mode === 'generate' ? 'Auditoria automàtica' : '';

  return `
    ${mode === 'generate' ? `<h3 style="font-size: var(--fs-lg); font-weight: 700; margin: var(--sp-8) 0 var(--sp-4); padding-top: var(--sp-6); border-top: 1px solid var(--c-border);">🔍 ${sectionTitle}</h3>` : ''}
    
    <!-- Semaphore -->
    ${audit.semafor ? renderSemaphore(audit.semafor) : ''}
    
    <!-- Verdict -->
    ${audit.veredicte ? `<div style="background: var(--c-surface); border: 1px solid var(--c-border); border-radius: var(--r-lg); padding: var(--sp-5); margin-bottom: var(--sp-4); font-size: var(--fs-sm); line-height: 1.7;">${audit.veredicte}</div>` : ''}
    
    <!-- Strengths -->
    ${audit.punts_forts?.length ? renderAccordion('✅ Punts forts', `<ul>${audit.punts_forts.map(p => `<li>${p}</li>`).join('')}</ul>`, true) : ''}
    
    <!-- Risks -->
    ${audit.riscos?.length ? renderAccordion('⚠️ Riscos detectats', renderRisks(audit.riscos), true) : ''}
    
    <!-- Improvements -->
    ${audit.millores?.length ? renderAccordion('💡 Propostes de millora', renderImprovements(audit.millores), true) : ''}
    
    <!-- Details -->
    ${audit.mihia_detectat ? renderAccordion('📊 MIHIA detectat', renderDetectedMIHIA(audit.mihia_detectat)) : ''}
    ${audit.competencies4D ? renderAccordion('🧭 Competències 4D', renderCompetencies4D(audit.competencies4D, true)) : ''}
    ${audit.reflexio_ppi ? renderAccordion('🪞 Reflexió PPI', renderPPIAudit(audit.reflexio_ppi)) : ''}
    ${audit.inclusio ? renderAccordion('♿ Inclusió', renderInclusioAudit(audit.inclusio)) : ''}
    ${audit.principis_rectors ? renderAccordion('🏛️ Principis rectors', renderPrincipis(audit.principis_rectors)) : ''}
  `;
}

// --- Component Renderers ---

function renderSemaphore(sem) {
  const colorClass = sem.nivell === 'verd' ? 'green' : sem.nivell === 'vermell' ? 'red' : 'yellow';
  const emoji = sem.nivell === 'verd' ? '🟢' : sem.nivell === 'vermell' ? '🔴' : '🟡';
  const label = sem.nivell === 'verd' ? 'Fricció productiva' : sem.nivell === 'vermell' ? 'Risc de delegació' : 'Atenció parcial';

  return `
    <div class="semaphore ${colorClass}">
      <div class="semaphore-light">${emoji}</div>
      <div class="semaphore-text">
        <div class="semaphore-label">${label}</div>
        <div class="semaphore-desc">${sem.justificacio || sem.resum || ''}</div>
      </div>
    </div>
  `;
}

function renderSequence(seq) {
  if (!Array.isArray(seq)) return '';
  return `
    <div class="accordion open">
      <button class="accordion-header">
        <span class="accordion-icon">📋</span>
        <span class="accordion-title">Seqüència didàctica</span>
        <span class="accordion-chevron">▼</span>
      </button>
      <div class="accordion-body result-content">
        ${seq.map((fase, i) => `
          <div style="padding: var(--sp-4); background: var(--c-surface-2); border-radius: var(--r-md); margin-bottom: var(--sp-3);">
            <div style="display: flex; align-items: center; gap: var(--sp-3); margin-bottom: var(--sp-2);">
              <span style="background: var(--c-primary); color: white; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: var(--fs-xs); font-weight: 700;">${i + 1}</span>
              <strong>${fase.fase || `Fase ${i + 1}`}</strong>
              ${fase.durada ? `<span class="badge">${fase.durada}</span>` : ''}
              ${fase.usaIA ? '<span class="badge badge-accent">🤖 IA</span>' : '<span class="badge">👤 Sense IA</span>'}
            </div>
            <p>${fase.descripcio || ''}</p>
            ${fase.instruccions_alumne ? `<p style="margin-top: var(--sp-2);"><strong>Instruccions alumne:</strong> ${fase.instruccions_alumne}</p>` : ''}
            ${fase.instruccions_docent ? `<p style="margin-top: var(--sp-2);"><strong>Instruccions docent:</strong> ${fase.instruccions_docent}</p>` : ''}
            ${fase.prompt_alumne ? `<blockquote style="margin-top: var(--sp-2);">💬 Prompt: "${fase.prompt_alumne}"</blockquote>` : ''}
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

function renderAccordion(title, content, openByDefault = false) {
  const icon = title.match(/^(\S+)/)?.[1] || '📄';
  const label = title.replace(/^\S+\s*/, '');
  return `
    <div class="accordion ${openByDefault ? 'open' : ''}">
      <button class="accordion-header">
        <span class="accordion-icon">${icon}</span>
        <span class="accordion-title">${label}</span>
        <span class="accordion-chevron">▼</span>
      </button>
      <div class="accordion-body result-content">${content}</div>
    </div>
  `;
}

function renderMIHIA(mihia) {
  return `<p><strong>Nivell ${mihia.nivell}:</strong> ${mihia.nom || ''}</p><p>${mihia.justificacio || ''}</p>`;
}

function renderRole(rol) {
  return `
    <p><strong>Rol principal:</strong> ${rol.principal || ''}</p>
    <p>${rol.descripcio || ''}</p>
    <p><em>${rol.justificacio || ''}</em></p>
    ${rol.secundari ? `<p><strong>Rol secundari:</strong> ${rol.secundari}</p>` : ''}
  `;
}

function renderCompetencies4DBadges(comp) {
  if (!comp) return '';
  const badges = [];
  if (comp.D1_delegacio?.activa || comp.D1_delegacio?.present) badges.push('D1');
  if (comp.D2_descripcio?.activa || comp.D2_descripcio?.present) badges.push('D2');
  if (comp.D3_discerniment?.activa || comp.D3_discerniment?.present) badges.push('D3');
  if (comp.D4_diligencia?.activa || comp.D4_diligencia?.present) badges.push('D4');
  return badges.map(d => `<span class="badge badge-primary">${d}</span>`).join('');
}

function renderCompetencies4D(comp, isAudit = false) {
  if (!comp) return '';
  const field = isAudit ? 'present' : 'activa';
  const detailField = isAudit ? 'comentari' : 'detall';
  const entries = [
    ['D1 — Delegació', comp.D1_delegacio],
    ['D2 — Descripció', comp.D2_descripcio],
    ['D3 — Discerniment', comp.D3_discerniment],
    ['D4 — Diligència', comp.D4_diligencia],
  ];
  return entries.map(([label, data]) => {
    if (!data) return '';
    const active = data[field];
    return `<p>${active ? '✅' : '⬜'} <strong>${label}</strong>: ${data[detailField] || ''}</p>`;
  }).join('');
}

function renderGRR(grr) {
  return `<p><strong>Fase predominant:</strong> ${grr.fase_predominant || ''}</p><p>${grr.progressio || ''}</p>`;
}

function renderReflexio(ref) {
  return `<p><strong>Moment:</strong> ${ref.moment || ''}</p><p><strong>Pregunta:</strong> ${ref.pregunta || ''}</p>`;
}

function renderInclusio(inc) {
  return `<p><strong>DUA:</strong> ${inc.dua_aplicat || ''}</p><p><strong>Adaptacions:</strong> ${inc.adaptacions || ''}</p>`;
}

function renderRisks(risks) {
  return risks.map(r => `
    <div style="padding: var(--sp-3); background: ${r.severitat === 'alta' ? 'var(--c-red-bg)' : r.severitat === 'mitjana' ? 'var(--c-yellow-bg)' : 'var(--c-surface-2)'}; border-radius: var(--r-sm); margin-bottom: var(--sp-2);">
      <p><strong>${r.tipus || 'Risc'}</strong> <span class="badge">${r.severitat || ''}</span></p>
      <p>${r.descripcio || ''}</p>
      ${r.on ? `<p style="color: var(--c-text-muted);">📍 ${r.on}</p>` : ''}
    </div>
  `).join('');
}

function renderImprovements(imps) {
  return imps.map(imp => `
    <div style="padding: var(--sp-3); background: var(--c-green-bg); border-radius: var(--r-sm); margin-bottom: var(--sp-2);">
      <p><strong>${imp.descripcio || ''}</strong> <span class="badge badge-success">${imp.prioritat || ''}</span></p>
      <p>${imp.com || ''}</p>
      ${imp.marc_referencia ? `<p style="color: var(--c-text-muted); font-style: italic;">📚 ${imp.marc_referencia}</p>` : ''}
    </div>
  `).join('');
}

function renderDetectedMIHIA(mihia) {
  return `
    <p><strong>Nivell ${mihia.nivell}:</strong> ${mihia.nom || ''}</p>
    <p>Adequat: ${mihia.adequat ? '✅ Sí' : '⚠️ No'}</p>
    <p>${mihia.comentari || ''}</p>
  `;
}

function renderPPIAudit(ppi) {
  return `
    <p>${ppi.present ? '✅ Present' : '⚠️ No present'}</p>
    <p>${ppi.comentari || ''}</p>
    ${ppi.suggeriment ? `<p><strong>Suggeriment:</strong> ${ppi.suggeriment}</p>` : ''}
  `;
}

function renderInclusioAudit(inc) {
  return `
    <p>${inc.adequada ? '✅ Adequada' : '⚠️ Millorable'}</p>
    <p>${inc.comentari || ''}</p>
    ${inc.suggeriments?.length ? `<ul>${inc.suggeriments.map(s => `<li>${s}</li>`).join('')}</ul>` : ''}
  `;
}

function renderPrincipis(prin) {
  return `
    <p><strong>Compliment:</strong> ${prin.compliment || ''}</p>
    ${prin.alertes?.length ? `<ul>${prin.alertes.map(a => `<li>⚠️ ${a}</li>`).join('')}</ul>` : '<p>✅ Tots els principis respectats</p>'}
  `;
}
