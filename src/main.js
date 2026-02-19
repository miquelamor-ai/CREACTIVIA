// 1. IMPORTS (Sempre a dalt de tot)
import { getApiKey, setApiKey, getModel, setModel, getAvailableModels, setProvider, CONFIG } from './config.js';
import { testConnection } from './api/llm-provider.js';
import { orchestrate } from './skills/orchestrator.js';
import { renderGeneratorForm } from './ui/generator-form.js';
import { renderAuditorForm } from './ui/auditor-form.js';
import { renderResult } from './ui/result-view.js';
import { addToHistory } from './utils/history.js';
import { renderHistoryView } from './ui/history-view.js';

// ==========================================
// 2. CONFIGURACIÓ SUPABASE (RAG)
// ==========================================
const SUPABASE_URL = 'https://qlftykfqjwaxucoeqcjv.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFsZnR5a2ZxandheHVjb2VxY2p2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE0MjkxNjQsImV4cCI6MjA4NzAwNTE2NH0.m1NyE3ViywXKBNEWkh1nrwnhToiH8Y26HGY8GT5-f_8';

// Inicialitzem el client de forma segura
const supabaseClient = typeof supabase !== 'undefined' 
    ? supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY) 
    : null;

// Funció per cercar al currículum
async function cercarAlCurriculum(textUsuari, apiKeyUsuari) {
    if (!textUsuari || !apiKeyUsuari || !supabaseClient) return "";
    console.log("🔍 RAG: Buscant al currículum per:", textUsuari);

    try {
        // A. Embedding amb Google
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
        
        if (!response.ok) return ""; // Si falla Google, continuem sense RAG
        
        const data = await response.json();
        const vector = data.embedding.values;

        // B. Cerca a Supabase
        const { data: docs, error } = await supabaseClient.rpc('match_documents', {
            query_embedding: vector,
            match_threshold: 0.4, 
            match_count: 5
        });

        if (error) throw error;

        if (docs && docs.length > 0) {
            console.log(`✅ RAG: Trobats ${docs.length} fragments.`);
            return docs.map(d => d.content).join("\n\n---\n\n");
        }
        return "";
    } catch (err) {
        console.error("Error RAG:", err);
        return "";
    }
}

// ==========================================
// 3. CODI PRINCIPAL DE L'APP
// ==========================================

let currentMode = 'generate';

// DOM Elements
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

// Sidebar Elements
const sidebarApiKey = document.getElementById('sidebar-api-key');
const sidebarApiSave = document.getElementById('sidebar-api-save');
const sidebarApiTest = document.getElementById('sidebar-api-test');
const sidebarApiLabel = document.getElementById('sidebar-api-label');
const sidebarApiHelp = document.getElementById('sidebar-api-help');
const sidebarProvider = document.getElementById('sidebar-provider');
const sidebarModel = document.getElementById('sidebar-model');

// Init
function init() {
    setupSidebarSettings();
    setupNavigation();
    renderGeneratorForm(wizardContainer, handleGenerate);
    renderAuditorForm(auditorContainer, handleAudit);
    
    // Icones Lucide
    if (window.lucide) window.lucide.createIcons();
}

// Sidebar Logic
function setupSidebarSettings() {
    sidebarProvider.value = CONFIG.PROVIDER;

    const updateUI = () => {
        const provider = sidebarProvider.value;
        const key = getApiKey();
        sidebarApiKey.value = key || '';

        if (provider === 'gemini') {
            sidebarApiLabel.innerHTML = '<i data-lucide="key"></i> Google Key';
            sidebarApiKey.placeholder = 'AIzaSy...';
        } else {
            sidebarApiLabel.innerHTML = '<i data-lucide="key"></i> OpenRouter Key';
            sidebarApiKey.placeholder = 'sk-or-...';
        }
        if (window.lucide) window.lucide.createIcons();
    };

    const populateModels = () => {
        const models = getAvailableModels();
        const curr = getModel();
        sidebarModel.innerHTML = models.map(m => `
            <option value="${m.id}" ${m.id === curr ? 'selected' : ''}>${m.name}</option>
        `).join('');
    };

    updateUI();
    populateModels();

    sidebarApiSave.addEventListener('click', () => {
        const newKey = sidebarApiKey.value.trim();
        if (newKey) { setApiKey(newKey); alert('Clau desada correctament!'); }
    });

    sidebarApiTest.addEventListener('click', async () => {
        const key = sidebarApiKey.value.trim();
        const provider = sidebarProvider.value;
        if (!key) return alert('Introdueix una clau primer');
        
        try {
            const result = await testConnection(provider, key);
            alert(result.ok ? '✅ Connexió correcta!' : `❌ Error: ${result.message}`);
        } catch (err) {
            alert(`Error: ${err.message}`);
        }
    });

    sidebarProvider.addEventListener('change', () => {
        setProvider(sidebarProvider.value);
        updateUI();
        populateModels();
    });

    sidebarModel.addEventListener('change', () => setModel(sidebarModel.value));
}

// Navigation Logic
function setupNavigation() {
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            const mode = item.dataset.mode;
            currentMode = mode;
            
            navItems.forEach(t => t.classList.toggle('active', t.dataset.mode === mode));
            generateSection.classList.toggle('active', mode === 'generate');
            auditSection.classList.toggle('active', mode === 'audit');
            historySection.classList.toggle('active', mode === 'history');
            resultSection.classList.add('hidden');

            if (mode === 'history') {
                renderHistoryView(historyContainer, (item) => showResult(item, false));
            }
        });
    });
}

// --- GENERAR AMB RAG INTEGRAT ---
async function handleGenerate(formData) {
    const apiKey = getApiKey();
    if (!apiKey) {
        alert('❗ Necessites una Clau API per continuar');
        sidebarApiKey.focus();
        return;
    }

    showLoading('Consultant currículum...', 'Cercant sabers a la base de dades');

    try {
        // 1. Intentem buscar context si el proveïdor és Gemini
        if (sidebarProvider.value === 'gemini') {
            const query = `${formData.materia || ''} ${formData.tema || ''} ${formData.etapa || ''}`;
            const context = await cercarAlCurriculum(query, apiKey);
            
            if (context) {
                // Afegim el context al tema de forma invisible per l'usuari però visible per la IA
                formData.tema = (formData.tema || '') + `\n\n[CONTEXT CURRICULAR OFICIAL DE CATALUNYA]:\n${context}\n\n`;
            }
        }

        loadingText.textContent = 'Generant proposta pedagògica...';
        
        // 2. Generació normal
        const result = await orchestrate('generate', formData);
        showResult(result);

    } catch (error) {
        hideLoading();
        alert(`Error: ${error.message}`);
    }
}

async function handleAudit(params) {
    if (!getApiKey()) return alert('Falta Clau API');
    showLoading('Auditant...', 'Analitzant qualitat');
    try {
        const result = await orchestrate('audit', params);
        showResult(result);
    } catch (error) {
        hideLoading();
        alert(`Error: ${error.message}`);
    }
}

// Helpers UI
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
    if (saveToHistory && !result.error) addToHistory(result);

    generateSection.classList.remove('active');
    auditSection.classList.remove('active');
    historySection.classList.remove('active');
    resultSection.classList.remove('hidden');

    renderResult(resultContainer, result, () => {
        resultSection.classList.add('hidden');
        if (!saveToHistory) {
             document.querySelector('[data-mode="history"]').click();
        } else {
             document.querySelector('[data-mode="generate"]').click();
        }
    });
}

// Iniciem l'aplicació
init();
