// 1. PRIMER ELS IMPORTS (A DALT DE TOT, SENSE EXCEPCIÓ)
import { getApiKey, setApiKey, getModel, setModel, getAvailableModels, setProvider, CONFIG } from './config.js';
import { testConnection } from './api/llm-provider.js';
import { orchestrate } from './skills/orchestrator.js';
import { renderGeneratorForm } from './ui/generator-form.js';
import { renderAuditorForm } from './ui/auditor-form.js';
import { renderResult } from './ui/result-view.js';
import { addToHistory } from './utils/history.js';
import { renderHistoryView } from './ui/history-view.js';

// 2. CONFIGURACIÓ SUPABASE RAG
const SUPABASE_URL = 'https://qlftykfqjwaxucoeqcjv.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFsZnR5a2ZxandheHVjb2VxY2p2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE0MjkxNjQsImV4cCI6MjA4NzAwNTE2NH0.m1NyE3ViywXKBNEWkh1nrwnhToiH8Y26HGY8GT5-f_8';

// Inicialitzem el client de Supabase
// (Es carrega des del script de l'index.html)
const supabaseClient = typeof supabase !== 'undefined' 
    ? supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY) 
    : null;

// Funció que busca informació rellevant al currículum a Supabase
async function cercarAlCurriculum(textUsuari, apiKeyUsuari) {
    if (!textUsuari || !apiKeyUsuari || !supabaseClient) return "";
    console.log("🔍 Buscant al currículum per:", textUsuari);

    try {
        // A. Convertim la petició de l'usuari en un vector (Embedding) usant la seva clau
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-001:embedContent?key=${apiKeyUsuari}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    model: "models/gemini-embedding-001",
                    content: { parts: [{ text: textUsuari }] },
                    outputDimensionality: 768
                })
            }
        );
        
        if (!response.ok) throw new Error("Error en l'embedding de Google");
        
        const data = await response.json();
        const vectorUsuari = data.embedding.values;

        // B. Cridem a la funció SQL de Supabase per trobar fragments similars
        const { data: documents, error } = await supabaseClient.rpc('match_documents', {
            query_embedding: vectorUsuari,
            match_threshold: 0.4, 
            match_count: 5
        });

        if (error) throw error;

        if (documents && documents.length > 0) {
            console.log(`✅ Trobats ${documents.length} fragments de context.`);
            return documents.map(d => d.content).join("\n\n---\n\n");
        }
        
        console.log("⚠️ No s'ha trobat context específic.");
        return "";
    } catch (err) {
        console.error("Error en RAG:", err);
        return "";
    }
}

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

    if (window.lucide) window.lucide.createIcons();
}

// --- Sidebar Settings ---
function setupSidebarSettings() {
    sidebarProvider.value = CONFIG.PROVIDER;

    const updateApiKeyUI = () => {
        const provider = sidebarProvider.value;
        const key = getApiKey();
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
                alert(`Error: ${result.message}`);
            }
        } catch (err) {
            sidebarApiTest.classList.remove('loading', 'error');
            alert(`Error: ${err.message}`);
        }
        if (window.lucide) window.lucide.createIcons();
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
    const toast = document.createElement('div');
    toast.style.cssText = `position: fixed; bottom: 20px; left: 20px; background: var(--c-primary); color: white; padding: 10px 20px; border-radius: var(--r-md); font-size: 12px; font-weight: 700; z-index: 1000; box-shadow: var(--shadow-lg);`;
    toast.textContent = msg;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 2300);
}

function setupNavigation() {
    navItems.forEach(item => {
        item.addEventListener('click', () => switchMode(item.dataset.mode));
    });
}

function switchMode(mode) {
    currentMode = mode;
    navItems.forEach(t => t.classList.toggle('active', t.dataset.mode === mode));
    generateSection.classList.toggle('active', mode === 'generate');
    auditSection.classList.toggle('active', mode === 'audit');
    historySection.classList.toggle('active', mode === 'history');
    resultSection.classList.add('hidden');
    if (mode === 'history') renderHistoryView(historyContainer, (item) => showResult(item, false));
}

// --- HANDLER GENERATE AMB RAG INTEGRAT ---
async function handleGenerate(formData) {
    const apiKey = getApiKey();
    if (!apiKey) {
        showSuccess('❗ Necessites una Clau API');
        sidebarApiKey.focus();
        return;
    }

    showLoading('Analitzant currículum...', 'Buscant marcs teòrics i sabers a Supabase');

    try {
        // 1. Busquem context al currículum (RAG)
        const queryRAG = `${formData.materia || ''} ${formData.tema || ''} ${formData.etapa || ''}`;
        const contextCurricular = await cercarAlCurriculum(queryRAG, apiKey);

        // 2. Si hi ha context, l'injectem al formulari abans d'enviar a l'orquestrador
        if (contextCurricular) {
            console.log("📝 Injectant context oficial al prompt...");
            formData.contextOficial = contextCurricular; 
            // Nota: L'orquestrador ha de saber llegir formData.contextOficial 
            // O pots concatenar-lo al tema:
            formData.tema = (formData.tema || '') + `\n\n[CONTEXT CURRICULAR OFICIAL]:\n${contextCurricular}`;
        }

        loadingText.textContent = 'Generant proposta pedagògica...';
        loadingSub.textContent = 'Dissenyant l\'activitat amb IA';

        // 3. Executem la generació normal
        const result = await orchestrate('generate', formData);
        showResult(result);

    } catch (error) {
        hideLoading();
        alert(`Error: ${error.message}`);
    }
}

async function handleAudit(params) {
    if (!getApiKey()) {
        showSuccess('❗ Necessites una Clau API');
        sidebarApiKey.focus();
        return;
    }
    showLoading('Auditant l\'activitat...', 'Analitzant criteris de qualitat');
    try {
        const result = await orchestrate('audit', params);
        showResult(result);
    } catch (error) {
        hideLoading();
        alert(`Error: ${error.message}`);
    }
}

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
    if (saveToHistory && !result.error) {
        const savedItem = addToHistory(result);
        if (savedItem) result.id = savedItem.id;
    }
    generateSection.classList.remove('active');
    auditSection.classList.remove('active');
    historySection.classList.remove('active');
    resultSection.classList.remove('hidden');
    renderResult(resultContainer, result, () => {
        resultSection.classList.add('hidden');
        saveToHistory ? switchMode(currentMode) : switchMode('history');
    });
}

init();
