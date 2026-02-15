// CREACTIVITAT — History Manager

const STORAGE_KEY = 'creactivitat_history';
const MAX_ITEMS = 50;

/**
 * Get full history
 * @returns {Array} Array of history items
 */
export function getHistory() {
    try {
        const json = localStorage.getItem(STORAGE_KEY);
        return json ? JSON.parse(json) : [];
    } catch (e) {
        console.error('Error reading history:', e);
        return [];
    }
}

/**
 * Add a result to history
 * @param {object} result - The full result object (mode, activity, audit)
 */
export function addToHistory(result) {
    if (result.error) return; // Don't save errors

    const history = getHistory();
    const newItem = {
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        mode: result.mode,
        activity: result.activity,
        audit: result.audit
    };

    // Add to beginning
    history.unshift(newItem);

    // Limit size
    if (history.length > MAX_ITEMS) {
        history.length = MAX_ITEMS;
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
    return newItem;
}

/**
 * Delete an item by ID
 * @param {string} id 
 */
export function deleteFromHistory(id) {
    let history = getHistory();
    history = history.filter(item => item.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
}

/**
 * Clear all history
 */
export function clearHistory() {
    localStorage.removeItem(STORAGE_KEY);
}
