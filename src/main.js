// CREACTIVITAT — Main Entry Point
import { getApiKey, setApiKey } from './config.js';
import { orchestrate } from './skills/orchestrator.js';
import { renderWizard } from './ui/wizard.js';
import { renderAuditorForm } from './ui/auditor-form.js';
import { renderResult } from './ui/result-view.js';
import { renderSettingsModal } from './ui/settings.js';

// --- State ---
let currentMode = 'generate';

// --- DOM Elements ---
const modeTabs = document.querySelectorAll('.tab');
const generateSection = document.getElementById('generate-section');
const auditSection = document.getElementById('audit-section');
const resultSection = document.getElementById('result-section');
const wizardContainer = document.getElementById('wizard-container');
const auditorContainer = document.getElementById('auditor-container');
const resultContainer = document.getElementById('result-container');
const loadingOverlay = document.getElementById('loading-overlay');
const loadingText = document.querySelector('.loading-text');
const loadingSub = document.querySelector('.loading-sub');
const apiBanner = document.getElementById('api-key-banner');
const apiInput = document.getElementById('api-key-input');
const apiSave = document.getElementById('api-key-save');

// --- Init ---
function init() {
    setupAPIKey();
    setupModeTabs();
    setupSettings();
    renderWizard(wizardContainer, handleGenerate);
    renderAuditorForm(auditorContainer, handleAudit);
}

// --- API Key ---
function setupAPIKey() {
    const key = getApiKey();
    if (key) {
        apiBanner.classList.add('hidden');
        apiInput.value = key;
    }

    apiSave.addEventListener('click', () => {
        const key = apiInput.value.trim();
        if (key) {
            setApiKey(key);
            apiBanner.classList.add('hidden');
        }
    });

    apiInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') apiSave.click();
    });
}

// --- Settings ---
function setupSettings() {
    const settingsBtn = document.getElementById('settings-btn');
    if (settingsBtn) {
        settingsBtn.addEventListener('click', () => {
            // Create a container for the modal if it doesn't exist
            let modalContainer = document.getElementById('modal-container');
            if (!modalContainer) {
                modalContainer = document.createElement('div');
                modalContainer.id = 'modal-container';
                document.body.appendChild(modalContainer);
            }
            renderSettingsModal(modalContainer, () => {
                // Callback when closed (optional)
            });
        });
    }
}

// --- Mode Tabs ---
function setupModeTabs() {
    modeTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const mode = tab.dataset.mode;
            switchMode(mode);
        });
    });
}

function switchMode(mode) {
    currentMode = mode;
    modeTabs.forEach(t => t.classList.toggle('active', t.dataset.mode === mode));

    generateSection.classList.toggle('active', mode === 'generate');
    auditSection.classList.toggle('active', mode === 'audit');
    resultSection.classList.add('hidden');
}

// --- Handlers ---
async function handleGenerate(formData) {
    if (!getApiKey()) {
        apiBanner.classList.remove('hidden');
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
        apiBanner.classList.remove('hidden');
        return;
    }

    showLoading('Auditant l\'activitat...', 'Analitzant segons els marcs pedagògics');

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

function showResult(result) {
    hideLoading();

    // Hide input sections, show result
    generateSection.classList.remove('active');
    auditSection.classList.remove('active');
    resultSection.classList.remove('hidden');

    renderResult(resultContainer, result, () => {
        // On back: show input again
        resultSection.classList.add('hidden');
        switchMode(currentMode);
    });
}

// --- Start ---
init();
