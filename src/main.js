// 1. PRIMER ELS IMPORTS (A DALT DE TOT, SENSE EXCEPCIÓ)
import { getApiKey, setApiKey, getModel, setModel, getAvailableModels, setProvider, CONFIG } from './config.js';
import { testConnection } from './api/llm-provider.js';
import { orchestrate } from './skills/orchestrator.js';
import { renderGeneratorForm } from './ui/generator-form.js';
import { renderAuditorForm } from './ui/auditor-form.js';
import { renderResult } from './ui/result-view.js';
import { addToHistory } from './utils/history.js';
import { renderHistoryView } from './ui/history-view.js';

// --- State ---
let currentMode = 'generate';

// --- DOM Elements ---
const navItems = document.querySelectorAll('.nav-item');
const generateSection = document.getElementById('generate-section');
const auditSection = document.getElementById('audit-section');
const historySection = document.getElementById('history-section');
const resultSection = document.getElementById('result-section');
const wizardContainer = document.getElementById('wizard-container');
const auditorContainer = document.getElementById('auditor-container');
const historyContainer = document.getElementById('history-container');
const resultContainer = document.getElementById('result-container');
const loadingOverlay = document.getElementById('loading-overlay');
const loadingText = document.querySelector('.loading-text');
const loadingSub = document.querySelector('.loading-sub');

// Sidebar Settings
const sidebarApiKey = document.getElementById('sidebar-api-key');
const sidebarApiSave = document.getElementById('sidebar-api-save');
const sidebarApiTest = document.getElementById('sidebar-api-test');
const sidebarApiLabel = document.getElementById('sidebar-api-label');
const sidebarApiHelp = document.getElementById('sidebar-api-help');
const sidebarProvider = document.getElementById('sidebar-provider');
const sidebarModel = document.getElementById('sidebar-model');

// --- Init ---
function init() {
    setupSidebarSettings();
    setupNavigation();
    renderGeneratorForm(wizardContainer, handleGenerate);
    renderAuditorForm(auditorContainer, handleAudit);

    // Initialize icons
    if (window.lucide) window.lucide.createIcons();
}

// --- Sidebar Settings ---
function setupSidebarSettings() {
    sidebarProvider.value = CONFIG.PROVIDER;

    const updateApiKeyUI = () => {
        const provider = sidebarProvider.value;
        const key = getApiKey(); // Uses current CONFIG.PROVIDER
        sidebarApiKey.value = key || '';

        if (provider === 'gemini') {
            sidebarApiLabel.innerHTML = '<i data-lucide="key"></i> Google Key';
            sidebarApiHelp.innerHTML = '<a href="https://aistudio.google.com/app/apikey" target="_blank">Aconsegueix clau de Google</a>';
            sidebarApiKey.placeholder = 'AIzaSy...';
        } else {
            sidebarApiLabel.innerHTML = '<i data-lucide="key"></i> OpenRouter Key';
            sidebarApiHelp.innerHTML = '<a href="https://openrouter.ai/keys" target="_blank">Aconsegueix clau d\'OpenRouter</a>';
            sidebarApiKey.placeholder = 'sk-or-...';
        }
        if (window.lucide) window.lucide.createIcons();
    };

    const populateModels = () => {
        const models = getAvailableModels();
        const currentModel = getModel();

        // Ensure currentModel is in the list if it's a custom one not found in presets
        const isKnown = models.some(m => m.id === currentModel);
        const displayModels = [...models];
        if (!isKnown && currentModel && currentModel !== 'custom') {
            displayModels.push({ id: currentModel, name: `Personalitzat (${currentModel})` });
        }

        sidebarModel.innerHTML = displayModels.map(m => `
            <option value="${m.id}" ${m.id === currentModel ? 'selected' : ''}>
                ${m.name}
            </option>
        `).join('');
    };

    updateApiKeyUI();
    populateModels();

    // Save Handlers
    sidebarApiSave.addEventListener('click', () => {
        const newKey = sidebarApiKey.value.trim();
        if (newKey) {
            setApiKey(newKey);
            showSuccess('Clau API desada');
        }
    });

    sidebarApiTest.addEventListener('click', async () => {
        const key = sidebarApiKey.value.trim();
        const provider = sidebarProvider.value;

        if (!key) {
            showSuccess('❗ Introdueix una clau primer');
            return;
        }

        sidebarApiTest.classList.add('loading');
        sidebarApiTest.innerHTML = '<i data-lucide="loader-2"></i>';
        if (window.lucide) window.lucide.createIcons();

        try {
            const result = await testConnection(provider, key);
            sidebarApiTest.classList.remove('loading');

            if (result.ok) {
                sidebarApiTest.classList.add('success');
                sidebarApiTest.innerHTML = '<i data-lucide="check"></i>';
                showSuccess('✅ Connexió correcta!');
            } else {
                sidebarApiTest.classList.add('error');
                sidebarApiTest.innerHTML = '<i data-lucide="x"></i>';
                alert(`Error de connexió: ${result.message}`);
            }
        } catch (err) {
            sidebarApiTest.classList.remove('loading');
            sidebarApiTest.classList.add('error');
            sidebarApiTest.innerHTML = '<i data-lucide="alert-triangle"></i>';
            alert(`Error: ${err.message}`);
        }

        if (window.lucide) window.lucide.createIcons();

        // Reset icon after 3 seconds
        setTimeout(() => {
            sidebarApiTest.classList.remove('success', 'error');
            sidebarApiTest.innerHTML = '<i data-lucide="zap"></i>';
            if (window.lucide) window.lucide.createIcons();
        }, 3000);
    });

    sidebarProvider.addEventListener('change', () => {
        setProvider(sidebarProvider.value);
        updateApiKeyUI();
        populateModels();
    });

    sidebarModel.addEventListener('change', () => {
        setModel(sidebarModel.value);
    });
}

function showSuccess(msg) {
    // Simple toast or alert replacement
    const toast = document.createElement('div');
    toast.style.cssText = `
        position: fixed; bottom: 20px; left: 20px; 
        background: var(--c-primary); color: white; 
        padding: 10px 20px; border-radius: var(--r-md);
        font-size: 12px; font-weight: 700; z-index: 1000;
        box-shadow: var(--shadow-lg); transition: all 0.3s ease;
    `;
    toast.textContent = msg;
    document.body.appendChild(toast);
    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 300);
    }, 2000);
}

// --- Navigation ---
function setupNavigation() {
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            const mode = item.dataset.mode;
            switchMode(mode);
        });
    });
}

function switchMode(mode) {
    currentMode = mode;
    navItems.forEach(t => t.classList.toggle('active', t.dataset.mode === mode));

    generateSection.classList.toggle('active', mode === 'generate');
    auditSection.classList.toggle('active', mode === 'audit');
    historySection.classList.toggle('active', mode === 'history');
    resultSection.classList.add('hidden');

    if (mode === 'history') {
        renderHistoryView(historyContainer, (historyItem) => {
            // View result from history
            showResult(historyItem, false); // false = don't save again
        });
    }
}

// --- Handlers ---
async function handleGenerate(formData) {
    if (!getApiKey()) {
        showSuccess('❗ Necessites una Clau API');
        sidebarApiKey.focus();
        return;
    }

    showLoading('Generant proposta pedagògica...', 'Consultant marcs teòrics i dissenyant l\'activitat');

    try {
        const result = await orchestrate('generate', formData);
        showResult(result);
    } catch (error) {
        hideLoading();
        alert(`Error: ${error.message}`);
        console.error('Generation error:', error);
    }
}

async function handleAudit(params) {
    if (!getApiKey()) {
        showSuccess('❗ Necessites una Clau API');
        sidebarApiKey.focus();
        return;
    }

    showLoading('Auditant l\'activitat...', 'Analitzant criteris pedagògics i dissenyant la millora');

    try {
        const result = await orchestrate('audit', params);
        showResult(result);
    } catch (error) {
        hideLoading();
        alert(`Error: ${error.message}`);
        console.error('Audit error:', error);
    }
}

// --- UI Helpers ---
function showLoading(text, sub) {
    loadingText.textContent = text;
    loadingSub.textContent = sub;
    loadingOverlay.classList.remove('hidden');
}

function hideLoading() {
    loadingOverlay.classList.add('hidden');
}

function showResult(result, saveToHistory = true) {
    hideLoading();

    // Auto-save to history if it's a new result
    if (saveToHistory && !result.error) {
        const savedItem = addToHistory(result);
        if (savedItem) result.id = savedItem.id; // Assign ID
    }

    // Hide input sections, show result
    generateSection.classList.remove('active');
    auditSection.classList.remove('active');
    historySection.classList.remove('active');
    resultSection.classList.remove('hidden');

    renderResult(resultContainer, result, () => {
        // On back: show input again
        resultSection.classList.add('hidden');
        // If we came from history, go back to history. Else go back to current mode.
        if (!saveToHistory) {
            switchMode('history');
        } else {
            switchMode(currentMode);
        }
    });
}

// --- Start ---
init();
