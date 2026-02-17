// CREACTIVITAT — History View
import { getHistory, deleteFromHistory, clearHistory } from '../utils/history.js';

export function renderHistoryView(container, onSelect) {
  const history = getHistory();
  let filtered = [...history];

  const render = () => {
    container.innerHTML = `
      <div class="history-view">
        <div class="history-header">
          <h2 class="history-title">📚 Historial d'Activitats</h2>
          <div class="history-header-actions">
            ${history.length > 0 ? '<button class="btn btn-ghost btn-sm" id="clear-history">🗑️ Esborra tot</button>' : ''}
          </div>
        </div>

        ${history.length > 0 ? renderFilters(history) : ''}
        
        <div id="history-results-container">
          ${filtered.length === 0 ? renderEmptyState(history.length > 0) : renderHistoryList(filtered)}
        </div>
      </div>
    `;

    setupEvents();
  };

  const setupEvents = () => {
    // Clear history
    const clearBtn = container.querySelector('#clear-history');
    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        if (confirm('Segur que vols esborrar tot l\'historial?')) {
          clearHistory();
          renderHistoryView(container, onSelect);
        }
      });
    }

    // Filter events
    const searchInput = container.querySelector('#history-search');
    const filters = container.querySelectorAll('.history-filter-select');

    const applyFilters = () => {
      const query = searchInput.value.toLowerCase();
      const activeFilters = {};
      filters.forEach(f => { if (f.value) activeFilters[f.dataset.key] = f.value; });

      filtered = history.filter(item => {
        const act = item.activity || {};
        const meta = act.metadata || {};

        // Search check
        const textMatch = !query ||
          (act.titol || '').toLowerCase().includes(query) ||
          (act.tema || '').toLowerCase().includes(query) ||
          (act.materia || '').toLowerCase().includes(query);

        // Metadata checks
        const metaMatch = Object.entries(activeFilters).every(([key, val]) => {
          const itemVal = meta[key] || act[key] || item[key];
          return String(itemVal) === val;
        });

        return textMatch && metaMatch;
      });

      const resultsDiv = container.querySelector('#history-results-container');
      resultsDiv.innerHTML = filtered.length === 0 ? renderEmptyState(true) : renderHistoryList(filtered);
    };

    if (searchInput) {
      searchInput.addEventListener('input', applyFilters);
      filters.forEach(f => f.addEventListener('change', applyFilters));
    }

    // Card Actions
    const list = container.querySelector('.history-list');
    if (list) {
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
          if (e.target.closest('.btn-delete')) return;
          const id = card.dataset.id;
          const item = history.find(h => h.id === id);
          if (item) onSelect(item);
        }
      });
    }
  };

  render();
}

function renderFilters(history) {
  // Extract unique values for filters
  const getUniques = (key) => {
    const vals = history.map(h => {
      const act = h.activity || {};
      return act.metadata?.[key] || act[key] || h[key];
    }).filter(Boolean);
    return [...new Set(vals)].sort();
  };

  const stages = getUniques('etapa');
  const types = getUniques('granularitat');
  const subjects = getUniques('materia');
  const levels = getUniques('nivell');

  return `
    <div class="history-filters">
      <div class="search-box">
        <i data-lucide="search"></i>
        <input type="text" id="history-search" placeholder="Cerca per títol, tema..." class="input-search">
      </div>
      <div class="filter-group">
        <select class="history-filter-select" data-key="etapa">
          <option value="">Totes les etapes</option>
          ${stages.map(s => `<option value="${s}">${s}</option>`).join('')}
        </select>
        <select class="history-filter-select" data-key="materia">
          <option value="">Totes les matèries</option>
          ${subjects.map(s => `<option value="${s}">${s}</option>`).join('')}
        </select>
        <select class="history-filter-select" data-key="granularitat">
          <option value="">Tots els tipus</option>
          ${types.map(t => `<option value="${t}">${t}</option>`).join('')}
        </select>
        <select class="history-filter-select" data-key="nivell">
          <option value="">Tots els nivells</option>
          ${levels.map(l => `<option value="${l}">${l}</option>`).join('')}
        </select>
      </div>
    </div>
  `;
}

function renderEmptyState(isFiltered = false) {
  return `
    <div class="empty-state">
      <div class="empty-icon">🔎</div>
      <p>${isFiltered ? 'No s\'ha trobat cap activitat amb aquests filtres.' : 'Encara no tens cap activitat guardada.'}</p>
      ${isFiltered ? '' : '<p class="empty-sub">Les activitats es guarden automàticament quan les generes.</p>'}
    </div>
  `;
}

function renderHistoryList(history) {
  return `
    <div class="history-list">
      ${history.map(item => {
    const act = item.activity || {};
    const title = item.mode === 'generate' ? (act.titol || 'Sense títol') : 'Auditoria';
    const date = new Date(item.timestamp || Date.now()).toLocaleDateString();
    const typeBadge = item.mode === 'generate' ? '<span class="badge badge-primary">Generació</span>' : '<span class="badge badge-accent">Auditoria</span>';
    const meta = act.metadata || act || {};
    const subtitle = [meta.etapa, meta.materia].filter(Boolean).join(' • ');

    return `
          <div class="history-card" data-id="${item.id}">
            <div class="history-card-content">
              <div class="history-card-top">
                <span class="history-card-date">${date}</span>
                ${typeBadge}
              </div>
              <h3 class="history-card-title">${title}</h3>
              <div class="history-card-meta">${subtitle}</div>
            </div>
            <div class="history-card-actions">
              <button class="btn btn-ghost btn-sm btn-delete" data-id="${item.id}" title="Esborra">🗑️</button>
              <button class="btn btn-secondary btn-sm btn-view">Obre</button>
            </div>
          </div>
        `;
  }).sort((a, b) => b.timestamp - a.timestamp).join('')}
    </div>
  `;
}
