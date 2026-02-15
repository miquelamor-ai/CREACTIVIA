// CREACTIVITAT — History View

import { getHistory, deleteFromHistory, clearHistory } from '../utils/history.js';

export function renderHistoryView(container, onSelect) {
  const history = getHistory();

  container.innerHTML = `
    <div class="history-view">
      <div class="history-header">
        <h2 class="history-title">📚 Historial d'Activitats</h2>
        ${history.length > 0 ? '<button class="btn btn-ghost btn-sm" id="clear-history">🗑️ Esborra tot</button>' : ''}
      </div>
      
      ${history.length === 0 ? renderEmptyState() : renderHistoryList(history)}
    </div>
  `;

  // Events
  if (history.length > 0) {
    container.querySelector('#clear-history').addEventListener('click', () => {
      if (confirm('Segur que vols esborrar tot l\'historial?')) {
        clearHistory();
        renderHistoryView(container, onSelect);
      }
    });

    // Delegate clicks for list items
    const list = container.querySelector('.history-list');
    list.addEventListener('click', (e) => {
      const card = e.target.closest('.history-card');
      if (!card) return;



      if (e.target.closest('.btn-delete')) {
        const id = e.target.closest('.btn-delete').dataset.id;
        deleteFromHistory(id);
        renderHistoryView(container, onSelect);
        return;
      }

      if (e.target.closest('.btn-view') || e.target.closest('.history-card')) {
        // If clicked anywhere else on card (except delete button), view it
        // But clicking delete button propagates? We stopped it with return above.
        if (e.target.closest('.btn-delete')) return;

        const id = card.dataset.id;
        const item = history.find(h => h.id === id);
        if (item) onSelect(item);
      }
    });
  }
}

function renderEmptyState() {
  return `
    <div style="text-align: center; padding: var(--sp-12); color: var(--c-text-muted);">
      <div style="font-size: var(--fs-3xl); margin-bottom: var(--sp-4);">📭</div>
      <p>Encara no tens cap activitat guardada.</p>
      <p style="font-size: var(--fs-sm);">Les activitats es guarden automàticament quan les generes.</p>
    </div>
  `;
}

function renderHistoryList(history) {
  return `
    <div class="history-list">
      ${history.map(item => {
    const title = item.mode === 'generate' ? (item.activity?.titol || 'Sense títol') : 'Auditoria';
    const date = new Date(item.timestamp).toLocaleString();
    const typeBadge = item.mode === 'generate' ? '<span class="badge badge-primary">Generació</span>' : '<span class="badge badge-accent">Auditoria</span>';

    return `
          <div class="history-card" data-id="${item.id}">
            <div class="history-card-content">
              <div class="history-card-header">
                <h3 class="history-card-title">${title}</h3>
                ${typeBadge}
              </div>
              <div class="history-card-meta">${date}</div>
            </div>
            <div class="history-card-actions">
              <button class="btn btn-ghost btn-sm btn-delete" data-id="${item.id}" title="Esborra">🗑️</button>
              <button class="btn btn-secondary btn-sm btn-view">Veure</button>
            </div>
          </div>
        `;
  }).join('')}
    </div>
  `;
}
