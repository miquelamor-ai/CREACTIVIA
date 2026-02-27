// CREACTIVITAT — Result View UI
import { generateMarkdown } from '../utils/markdown-generator.js';
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
            <button class="btn btn-secondary btn-sm" id="btn-download-md" title="Descarrega Markdown"><i data-lucide="download"></i> Markdown</button>
      </div>
    </div>
    
    <div class="result-layout ${mode === 'generate' ? 'split-view' : 'sequential-view'}">
      ${mode === 'generate' ? renderGenerateSplit(activity, audit, result) : renderAuditSequential(audit, activity, result)}
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

  // Markdown Download Handler
  const dlBtnMd = container.querySelector('#btn-download-md');
  
  if (dlBtnMd) {
    dlBtnMd.addEventListener('click', () => {
      const markdown = generateMarkdown(result, mode, activity);
      const blob = new Blob([markdown], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `creactivitat-${mode}-${new Date().toISOString().slice(0, 10)}.md`;
      a.click();
      URL.revokeObjectURL(url);
    });
  }
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

  if (window.lucide) window.lucide.createIcons();
}

function renderGenerateSplit(act, audit, result) {
  const meta = act.metadata || {
    etapa: act.etapa,
    materia: act.materia,
    tema: act.tema,
    nivell: 'inicial',
    granularitat: act.granularitat,
    durada: act.durada
  };

  return `
    <!-- Left Column: Programming -->
    <div class="result-column programming">
      <h3 class="column-title"><i data-lucide="file-text"></i> Programació Didàctica</h3>
      <div class="result-card" style="padding: var(--sp-8);">
        ${act.resum ? `<p class="activity-summary" style="margin-bottom: var(--sp-8);">${act.resum.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')}</p>` : ''}
        
        <div class="activity-metadata-horizontal" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));">
          <div class="meta-box">
             <span class="meta-label">Matèria</span>
             <span class="meta-value">${meta.materia || '-'}</span>
          </div>
          <div class="meta-box">
             <span class="meta-label">Etapa</span>
             <span class="meta-value">${meta.etapa || '-'}</span>
          </div>
          <div class="meta-box">
             <span class="meta-label">Tipus</span>
             <span class="meta-value">${meta.granularitat || 'activitat'}</span>
          </div>
          <div class="meta-box">
             <span class="meta-label">Tema</span>
             <span class="meta-value">${meta.tema || '-'}</span>
          </div>
          <div class="meta-box">
             <span class="meta-label">Nivell</span>
             <span class="meta-value">${meta.nivell || 'inicial'}</span>
          </div>
          <div class="meta-box">
             <span class="meta-label">Durada</span>
             <span class="meta-value">${meta.durada || '1 sessió'}</span>
          </div>
        </div>

        <div class="programming-sections" style="display: flex; flex-direction: column; gap: var(--sp-6);">
          ${act.objectiu ? renderAccordion('🎯 Objectiu d\'Aprenentatge', `<p style="padding: var(--sp-2) 0;">${act.objectiu}</p>`, true) : ''}

          ${act.previ ? renderAccordion('🛠️ Preparació Prèvia (Docent i IA)', `
            <div class="previ-section" style="padding: var(--sp-2) 0;">
              <div class="previ-item"><strong>Configuració IA:</strong> ${act.previ.ia_config || ''}</div>
              <div class="previ-item"><strong>Prompt de Sistema:</strong> <code style="display:block; background: var(--c-surface-3); padding: var(--sp-3); border-radius: var(--r-sm); margin: var(--sp-2) 0; font-size: var(--fs-xs);">${act.previ.prompt_sistema || 'No cal configuració específica.'}</code></div>
              <div class="previ-item"><strong>Guardrails:</strong> ${act.previ.guardrails || ''}</div>
              <div class="previ-item" style="margin-top: var(--sp-4)"><strong>Preparació Docent:</strong> ${act.previ.preparacio_docent || ''}</div>
              <div class="previ-item"><strong>Preparació Alumne:</strong> ${act.previ.preparacio_alumne || ''}</div>
              
              <div class="alert alert-info" style="margin-top: var(--sp-6); font-size: var(--fs-xs); background: var(--c-primary-light); padding: var(--sp-4); border-radius: var(--r-md); border-left: 4px solid var(--c-primary); display: flex; gap: var(--sp-3);">
                <i data-lucide="info" style="width:16px; min-width:16px; margin-top: 2px; color: var(--c-primary)"></i>
                <span>Recordeu que per a alumnes menors d'edat cal comptar amb l'autorització del centre i les famílies per a l'ús d'eines d'IA.</span>
              </div>
            </div>
          `, false) : ''}

          <div class="sequence-section-block" style="margin-top: var(--sp-4);">
            <div class="sequence-section-title" style="margin-bottom: var(--sp-4); font-weight: 700; font-size: var(--fs-base); color: var(--c-text);">🗓️ Seqüència Didàctica</div>
            ${act.sequencia ? renderSequence(act.sequencia) : ''}
          </div>
          
          ${act.avaluacio ? renderAccordion('📊 Avaluació i Feedback', `
            <div class="avaluacio-section" style="padding: var(--sp-2) 0;">
              <div class="av-item"><strong>Criteris d'èxit:</strong> ${parseList(act.avaluacio.criteris)}</div>
              <div class="av-item" style="margin-top: var(--sp-4)"><strong>Estratègies formatives:</strong> <p>${act.avaluacio.estrategies || ''}</p></div>
              <p style="margin-top: var(--sp-4)"><strong>Feedback i Rúbrica:</strong> ${act.avaluacio.feedback || ''}</p>
            </div>
          `, false) : ''}

          <div class="final-sections" style="display: flex; flex-direction: column; gap: var(--sp-4);">
            ${act.inclusio ? renderAccordion('♿ Inclusió (DUA)', `<div style="padding: var(--sp-2) 0;"><p><strong>DUA:</strong> ${act.inclusio.dua_aplicat}</p><p><strong>Adaptacions:</strong> ${act.inclusio.adaptacions}</p></div>`) : ''}
            ${act.recomanacions_docent ? renderAccordion('💡 Recomanacions', `<p style="padding: var(--sp-2) 0;">${act.recomanacions_docent}</p>`) : ''}
          </div>
        </div>
      </div>
    </div>

    <!-- Right Column: Validation -->
    <div class="result-column validation">
      <h3 class="column-title"><i data-lucide="shield-check"></i> Validació Pedagògica</h3>
      
      ${act.sempieza ? renderSemaphore(act.sempieza) : ''}

      <div class="validation-grid">
        <div class="validation-card" style="padding: var(--sp-4);">
          <div class="vcard-title">📋 Fonaments</div>
          <div class="vcard-content">
            ${act.mihia ? `<div style="margin-bottom: var(--sp-4);"><strong>MIHIA:</strong> ${renderMIHIA(act.mihia)}</div>` : ''}
            ${act.rolIA ? `<div><strong>Rol IA:</strong> ${renderRole(act.rolIA)}</div>` : ''}
          </div>
        </div>
        
        ${act.competencies4D ? renderValidationCard('🧭 Competències 4D', renderCompetencies4D(act.competencies4D)) : ''}
        ${act.reflexio_ppi ? renderValidationCard('🪞 Reflexió (PPI)', renderReflexio(act.reflexio_ppi)) : ''}
      </div>

      ${act.riscos?.length ? renderAccordion('⚠️ Riscos a vigilar', `<ul>${act.riscos.map(r => `<li>${r}</li>`).join('')}</ul>`, true) : ''}
      
      ${renderTechnicalLog(result)}
    </div>
  `;
}

function renderTechnicalLog(result) {
  return `
    <div style="margin-top: var(--sp-8); opacity: 0.6; transition: opacity 0.3s;" onmouseover="this.style.opacity=1" onmouseout="this.style.opacity=0.6">
      ${renderAccordion('⚙️ Detalls Tècnics (Log)', `
        <div style="font-size: var(--fs-xs); line-height: 1.6;">
          <p><strong>Model:</strong> <code style="background: var(--c-surface-3); padding: 2px 4px; border-radius: 4px;">${result?.modelUsed || 'Desconegut'}</code></p>
          <p><strong>Inputs originals:</strong></p>
          <pre style="background: var(--c-surface-3); padding: var(--sp-3); border-radius: var(--r-sm); overflow-x: auto; max-height: 200px; font-family: monospace;">${JSON.stringify(result?.inputParams || {}, null, 2)}</pre>
          <p style="margin-top: var(--sp-2)"><strong>Timestamp:</strong> ${result?.timestamp ? new Date(result.timestamp).toLocaleString() : 'Desconegut'}</p>
        </div>
      `, false)}
    </div>
  `;
}

function renderAuditSequential(audit, activity, result) {
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
        
        ${renderTechnicalLog(result)}
      </div>
    </div>

    <!-- Bottom: Modified Proposal -->
    <div class="modified-proposal-section" style="margin-top: var(--sp-12);">
      <h3 class="column-title">🎯 Proposta Modificada</h3>
      <div class="result-layout split-view">
        ${activity ? renderGenerateSplit(activity, null, result) : '<p style="text-align:center; opacity: 0.5; padding: var(--sp-10);">Generant proposta millorada...</p>'}
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
    <div class="phase-windows-container" style="gap: var(--sp-4);">
      ${seq.map((fase, i) => {
    const docProto = fase.proto?.doc ?? 50;
    const aluProto = fase.proto?.alu ?? 50;
    const iaProto = fase.proto?.ia ?? (fase.usaIA ? 30 : 0);

    const headerHtml = `
      <div style="display: flex; align-items: center; gap: var(--sp-3); width: 100%;">
        <span class="phase-badge" style="margin:0">${i + 1}</span>
        <span style="flex: 1; font-weight: 700;">${fase.fase || `Fase ${i + 1}`}</span>
        <span style="font-size: var(--fs-xs); opacity: 0.7; display: flex; align-items: center; gap: 4px;">
          <i data-lucide="clock" style="width:12px"></i> ${fase.durada || '?'}
        </span>
        ${fase.usaIA ? '<span class="badge badge-accent" style="font-size: 10px; padding: 2px 8px;">🤖 IA</span>' : ''}
      </div>
    `;

    const phaseContent = `
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
              </div>
              ${renderRoleMetric('ia', iaProto)}
            </div>
          </div>
          <div class="phase-footer" style="background: var(--c-surface-2); border-radius: 0 0 var(--r-md) var(--r-md);">
            <div class="pedagogical-panel-inline" style="padding: var(--sp-4); font-size: var(--fs-sm); font-style: italic; color: var(--c-text-secondary);">
              <strong>Justificació:</strong> ${fase.referencia || ''}
            </div>
          </div>
    `;

    return renderAccordion(headerHtml, phaseContent, i === 0);
  }).join('')}
    </div>
  `;
}

function renderAccordion(title, content, openByDefault = false) {
  return `
    <div class="accordion ${openByDefault ? 'open' : ''}">
      <button class="accordion-header">
        <span class="accordion-title">${title}</span>
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
