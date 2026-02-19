import { getApiKey, setApiKey, getModel, setModel, getAvailableModels, setProvider, CONFIG } from './config.js';
import { testConnection } from './api/llm-provider.js';
import { orchestrate } from './skills/orchestrator.js';
import { renderGeneratorForm } from './ui/generator-form.js';
import { renderAuditorForm } from './ui/auditor-form.js';
import { renderResult } from './ui/result-view.js';
import { addToHistory } from './utils/history.js';
import { renderHistoryView } from './ui/history-view.js';

const SUPABASE_URL = 'https://qlftykfqjwaxucoeqcjv.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFsZnR5a2ZxandheHVjb2VxY2p2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE0MjkxNjQsImV4cCI6MjA4NzAwNTE2NH0.m1NyE3ViywXKBNEWkh1nrwnhToiH8Y26HGY8GT5-f_8';

const supabaseClient = typeof supabase !== 'undefined' ? supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;

async function cercarAlCurriculum(textUsuari, apiKeyUsuari) {
    if (!textUsuari || !apiKeyUsuari || !supabaseClient) return "";
    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-001:embedContent?key=${apiKeyUsuari}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ model: "models/gemini-embedding-001", content: { parts: [{ text: textUsuari }] }, outputDimensionality: 768 })
        });
        const data = await response.json();
        const { data: docs } = await supabaseClient.rpc('match_documents', { query_embedding: data.embedding.values, match_threshold: 0.4, match_count: 5 });
        return docs ? docs.map(d => d.content).join("\n\n---\n\n") : "";
    } catch (e) { return ""; }
}

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
const sidebarApiKey = document.getElementById('sidebar-api-key');
const sidebarApiSave = document.getElementById('sidebar-api-save');
const sidebarApiTest = document.getElementById('sidebar-api-test');
const sidebarApiLabel = document.getElementById('sidebar-api-label');
const sidebarProvider = document.getElementById('sidebar-provider');
const sidebarModel = document.getElementById('sidebar-model');

function init() {
    setupSidebarSettings();
    setupNavigation();
    renderGeneratorForm(wizardContainer, handleGenerate);
    renderAuditorForm(auditorContainer, handleAudit);
    if (window.lucide) window.lucide.createIcons();
}

function setupSidebarSettings() {
    sidebarProvider.value = CONFIG.PROVIDER;
    const updateUI = () => {
        sidebarApiKey.value = getApiKey() || '';
        const models = getAvailableModels();
        const curr = getModel();
        sidebarModel.innerHTML = models.map(m => `<option value="${m.id}" ${m.id === curr ? 'selected' : ''}>${m.name}</option>`).join('');
        if (window.lucide) window.lucide.createIcons();
    };
    updateUI();
    sidebarApiSave.addEventListener('click', () => { setApiKey(sidebarApiKey.value); alert('Clau desada'); });
    sidebarProvider.addEventListener('change', () => { setProvider(sidebarProvider.value); updateUI(); });
    sidebarModel.addEventListener('change', () => setModel(sidebarModel.value));
}

function setupNavigation() {
    navItems.forEach(item => item.addEventListener('click', () => {
        navItems.forEach(t => t.classList.remove('active'));
        item.classList.add('active');
        const mode = item.dataset.mode;
        generateSection.classList.toggle('active', mode === 'generate');
        auditSection.classList.toggle('active', mode === 'audit');
        historySection.classList.toggle('active', mode === 'history');
        resultSection.classList.add('hidden');
        if (mode === 'history') renderHistoryView(historyContainer, (item) => showResult(item, false));
    }));
}

async function handleGenerate(formData) {
    const key = getApiKey();
    if (!key) return alert('Falta clau');
    loadingOverlay.classList.remove('hidden');
    try {
        const context = await cercarAlCurriculum(`${formData.materia} ${formData.tema}`, key);
        if (context) formData.tema += `\n\n[CONTEXT CURRICULAR]:\n${context}`;
        const result = await orchestrate('generate', formData);
        showResult(result);
    } catch (e) { alert(e.message); loadingOverlay.classList.add('hidden'); }
}

async function handleAudit(params) {
    loadingOverlay.classList.remove('hidden');
    try { const result = await orchestrate('audit', params); showResult(result); } catch (e) { alert(e.message); loadingOverlay.classList.add('hidden'); }
}

function showResult(result, save = true) {
    loadingOverlay.classList.add('hidden');
    if (save && !result.error) addToHistory(result);
    generateSection.classList.remove('active');
    auditSection.classList.remove('active');
    historySection.classList.remove('active');
    resultSection.classList.remove('hidden');
    renderResult(resultContainer, result, () => {
        resultSection.classList.add('hidden');
        generateSection.classList.add('active');
    });
}

init();
