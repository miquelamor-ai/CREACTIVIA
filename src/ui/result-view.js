// CREACTIVITAT — Result View UI

export function renderResult(container, result, onBack) {
  const { mode, activity, audit, error } = result;

  if (error) {
    container.innerHTML = `
        <div class="result-header">
          <button class="result-back" id="result-back" title="Torna"><i data-lucide="arrow-left"></i></button>
          <h2 class="result-title" style="color: var(--c-danger)">Error</h2>
        </div>
        
        <div class="result-content">
          <div style="padding: var(--sp-6); background: var(--c-red-bg); border-radius: var(--r-md); border: 1px solid var(--c-danger);">
            <p style="font-weight: 600; font-size: var(--fs-lg); margin-bottom: var(--sp-2);">Hi ha hagut un problema</p>
            <p>${error}</p>
            ${error.includes('429') ? `
              <div style="margin-top: var(--sp-4); padding-top: var(--sp-4); border-top: 1px solid rgba(239, 68, 68, 0.2);">
                <p style="font-weight: 600; margin-bottom: var(--sp-2);">💡 Consell de quota:</p>
                <ul style="margin-left: var(--sp-4); font-size: var(--fs-sm);">
                  <li>Estàs utilitzant la quota gratuïta. Hem augmentat la protecció contra el bombardeig de l'API (RPM), però si l'error persisteix, espera un minut.</li>
                  <li>Prova de canviar al model <strong>Gemini 1.5 Flash</strong> a la barra lateral (o a la configuració ⚙️), ja que és el que té els límits de quota més alts per al 2026.</li>
                </ul>
              </div>
            ` : ''}
          </div>
        </div>
      `;
    container.querySelector('#result-back').addEventListener('click', onBack);
    window.lucide.createIcons();
    return;
  }

  container.innerHTML = `
    <div class="result-header">
      <div style="display: flex; align-items: center; gap: var(--sp-4);">
        <button class="result-back" id="result-back" title="Torna"><i data-lucide="arrow-left"></i></button>
        <h2 class="result-title">${mode === 'generate' ? activity?.titol || 'Proposta' : 'Auditoria'}</h2>
      </div>
      <div class="result-actions">
        <button class="btn btn-secondary btn-sm" id="btn-copy" title="Copia"><i data-lucide="copy"></i> Copia</button>
        <button class="btn btn-secondary btn-sm" id="btn-download" title="Descarrega"><i data-lucide="download"></i> JSON</button>
      </div>
    </div>
    
    <div class="result-layout ${mode === 'generate' ? 'split-view' : 'sequential-view'}">
      ${mode === 'generate' ? renderGenerateSplit(activity, audit) : renderAuditSequential(audit, activity)}
    </div>
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

  // Phase Window Toggles (Pedagogical Panel)
  container.querySelectorAll('.pedagogical-toggle').forEach(toggle => {
    toggle.addEventListener('click', () => {
      const phaseIdx = toggle.dataset.phase;
      const panel = container.querySelector(`#ped-panel-${phaseIdx}`);
      if (panel) {
        panel.classList.toggle('hidden');
        const chevron = toggle.querySelector('.chevron');
        if (chevron) chevron.textContent = panel.classList.contains('hidden') ? '▼' : '▲';
      }
    });
  });
}

function renderGenerateSplit(act, audit) {
  return `
    <!-- Left Column: Programming -->
    <div class="result-column programming">
      <h3 class="column-title"><i data-lucide="file-text"></i> Programació Didàctica</h3>
      <div class="result-card">
        ${act.resum ? `<p class="activity-summary">${act.resum}</p>` : ''}
        
        <div class="activity-context-header">
          ${act.materia ? `<div class="context-item"><i data-lucide="book-open"></i> <strong>Matèria:</strong> ${act.materia}</div>` : ''}
          ${act.etapa ? `<div class="context-item"><i data-lucide="graduation-cap"></i> <strong>Etapa/Curs:</strong> ${act.etapa}</div>` : ''}
          ${act.tema ? `<div class="context-item"><i data-lucide="tag"></i> <strong>Tema:</strong> ${act.tema}</div>` : ''}
        </div>

        <div class="badges" style="margin-bottom: var(--sp-6); display: flex; gap: var(--sp-2); flex-wrap: wrap;">
          ${act.granularitat ? `<span class="badge badge-primary"><i data-lucide="layers" style="width:12px"></i> ${act.granularitat}</span>` : ''}
          ${act.durada ? `<span class="badge"><i data-lucide="clock" style="width:12px"></i> ${act.durada}</span>` : ''}
        </div>

        ${act.sequencia ? renderSequence(act.sequencia) : ''}
        
        <div style="margin-top: var(--sp-6);">
          ${act.evidencia_aprenentatge ? renderAccordion('📝 Evidència d\'aprenentatge', `<p>${act.evidencia_aprenentatge}</p>`, true) : ''}
          ${act.recomanacions_docent ? renderAccordion('💡 Recomanacions', `<p>${act.recomanacions_docent}</p>`) : ''}
        </div>
      </div>
    </div>

    <!-- Right Column: Validation -->
    <div class="result-column validation">
      <h3 class="column-title"><i data-lucide="shield-check"></i> Validació Pedagògica</h3>
      
      ${act.sempieza ? renderSemaphore(act.sempieza) : ''}

      <div class="validation-grid">
        ${act.mihia ? renderValidationCard('📊 MIHIA', renderMIHIA(act.mihia)) : ''}
        ${act.rolIA ? renderValidationCard('🎭 Rol IA', renderRole(act.rolIA)) : ''}
        ${act.competencies4D ? renderValidationCard('🧭 4D', renderCompetencies4D(act.competencies4D)) : ''}
        ${act.grr ? renderValidationCard('📈 GRR', renderGRR(act.grr)) : ''}
        ${act.reflexio_ppi ? renderValidationCard('🪞 Reflexió', renderReflexio(act.reflexio_ppi)) : ''}
      </div>

      ${act.riscos?.length ? renderAccordion('⚠️ Riscos a vigilar', `<ul>${act.riscos.map(r => `<li>${r}</li>`).join('')}</ul>`, true) : ''}
    </div>
  `;
}

function renderAuditSequential(audit, activity) {
  return `
    <!-- Top: Audit Report -->
    <div class="audit-report-section">
      <h3 class="column-title">🔍 Informe d'Auditoria</h3>
      
      <div class="result-card highlight">
        ${audit.semafor ? renderSemaphore(audit.semafor) : ''}
        ${audit.veredicte ? `<div class="audit-verdict">${audit.veredicte}</div>` : ''}
        
        <div class="validation-grid">
          ${audit.punts_forts?.length ? renderValidationCard('✅ Punts forts', `<ul>${audit.punts_forts.map(p => `<li>${p}</li>`).join('')}</ul>`) : ''}
          ${audit.riscos?.length ? renderValidationCard('⚠️ Riscos', renderRisks(audit.riscos)) : ''}
        </div>

        <div style="margin-top: var(--sp-6);">
          ${audit.millores?.length ? renderAccordion('💡 Propostes de millora', renderImprovements(audit.millores), true) : ''}
        </div>
      </div>
    </div>

    <!-- Bottom: Modified Proposal -->
    <div class="modified-proposal-section" style="margin-top: var(--sp-12);">
      <h3 class="column-title">🎯 Proposta Modificada</h3>
      <div class="result-layout split-view">
        ${activity ? renderGenerateSplit(activity) : '<p style="text-align:center; opacity: 0.5; padding: var(--sp-10);">Generant proposta millorada...</p>'}
      </div>
    </div>
  `;
}

function renderValidationCard(title, content) {
  return `
    <div class="validation-card">
      <div class="vcard-title">${title}</div>
      <div class="vcard-content">${content}</div>
    </div>
  `;
}

// --- Component Renderers ---

function renderSemaphore(sem) {
  const colorClass = sem.nivell === 'verd' ? 'green' : sem.nivell === 'vermell' ? 'red' : 'yellow';
  const icon = sem.nivell === 'verd' ? 'check-circle' : sem.nivell === 'vermell' ? 'alert-triangle' : 'alert-circle';
  const label = sem.nivell === 'verd' ? 'Fricció productiva' : sem.nivell === 'vermell' ? 'Risc de delegació' : 'Atenció parcial';

  return `
    <div class="semaphore ${colorClass}">
      <div class="semaphore-light"><i data-lucide="${icon}"></i></div>
      <div class="semaphore-text">
        <div class="semaphore-label">${label}</div>
        <div class="semaphore-desc">${sem.justificacio || sem.resum || ''}</div>
      </div>
    </div>
  `;
}

function parseList(text) {
  if (!text) return '';
  if (!text.includes('- ') && !text.includes('* ')) return text;
  const items = text.split('\n').filter(l => l.trim().startsWith('- ') || l.trim().startsWith('* '));
  if (items.length === 0) return text;
  return `<ul>${items.map(i => `<li>${i.trim().substring(2)}</li>`).join('')}</ul>`;
}

function renderRoleMetric(role, level = 0, label = "Protagonisme") {
  const colors = {
    docent: 'var(--c-primary)',
    alumne: 'var(--c-success)',
    ia: 'var(--c-accent)'
  };
  return `
    <div class="role-metrics">
      <div class="metric-header">
        <div class="metric-label">${label}</div>
        <div class="metric-info-icon" title="Nivell d'activitat i agència d'aquest rol en aquesta fase."><i data-lucide="help-circle"></i></div>
      </div>
      <div class="metric-bar-bg">
        <div class="metric-bar-fill" style="width: ${level}%; background: ${colors[role]}"></div>
      </div>
    </div>
  `;
}

function renderSequence(seq) {
  if (!Array.isArray(seq)) return '';
  return `
    <div class="phase-windows-container">
      ${seq.map((fase, i) => {
    // Use AI-provided proto levels or fall back to mock logic
    const docProto = fase.proto?.doc ?? (fase.docent?.length > 100 ? 80 : 50);
    const aluProto = fase.proto?.alu ?? (fase.alumne?.length > 100 ? 90 : 40);
    const iaProto = fase.proto?.ia ?? (fase.usaIA ? 70 : 10);

    return `
        <div class="phase-window" id="phase-${i}">
          <div class="phase-window-header">
            <div class="phase-info">
              <span class="phase-badge">${i + 1}</span>
              <span class="phase-title">${fase.fase || `Fase ${i + 1}`}</span>
              ${fase.durada ? `<span class="phase-duration"><i data-lucide="clock" style="width:12px"></i> ${fase.durada}</span>` : ''}
            </div>
            ${fase.usaIA ? '<span class="badge badge-accent">🤖 IA Activa</span>' : ''}
          </div>
          <div class="phase-roles-grid">
            <div class="role-sector">
              <div class="role-label"><i data-lucide="user"></i> Docent</div>
              <div class="role-content">${parseList(fase.docent)}</div>
              ${renderRoleMetric('docent', docProto)}
            </div>
            <div class="role-sector">
              <div class="role-label"><i data-lucide="users"></i> Alumne</div>
              <div class="role-content">${parseList(fase.alumne)}</div>
              ${renderRoleMetric('alumne', aluProto)}
            </div>
            <div class="role-sector sector-ia">
              <div class="role-label"><i data-lucide="bot"></i> IA</div>
              <div class="role-content">
                ${parseList(fase.ia) || (fase.usaIA ? 'Suport actiu' : 'Sense IA')}
                ${fase.prompt_alumne ? `<div class="seq-prompt">"${fase.prompt_alumne}"</div>` : ''}
              </div>
              ${renderRoleMetric('ia', iaProto)}
            </div>
          </div>
          <div class="phase-footer">
            <button class="pedagogical-toggle" data-phase="${i}">
              <i data-lucide="graduation-cap"></i>
              <span>Justificació Pedagògica</span>
              <i data-lucide="chevron-down" class="chevron"></i>
            </button>
          </div>
          <div class="pedagogical-panel hidden" id="ped-panel-${i}">
            <div class="ped-content">
              ${fase.referencia || 'Referència contextual no disponible.'}
            </div>
          </div>
        </div>
      `;
  }).join('')}
    </div>
  `;
}

function renderAccordion(title, content, openByDefault = false) {
  const label = title.replace(/^\S+\s*/, '');
  return `
    <div class="accordion ${openByDefault ? 'open' : ''}">
      <button class="accordion-header">
        <span class="accordion-title">${label}</span>
        <i data-lucide="chevron-down" class="accordion-chevron"></i>
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
