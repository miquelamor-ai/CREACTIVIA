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

// Funció per cercar al currículum (RAG)
async function cercarAlCurriculum(textUsuari, apiKeyUsuari) {
    if (!textUsuari || !apiKeyUsuari || !supabaseClient) return "";
    
    console.log(`🔍 RAG: Buscant vector per: "${textUsuari}"`);

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
        
        if (!response.ok) return ""; 
        
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
            console.log(`✅ RAG: Trobats ${docs.length} fragments rellevants.`);
            return docs.map(d => d.content).join("\n\n---\n\n");
        }
        return "";
    } catch (err) {
        console.error("Error RAG:", err);
        return "";
    }
}

// ==========================================
// 3. ESTRUCTURA APP
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
    console.log("🚀 App Inicialitzada correctament");
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

// ==========================================
// 4. GENERAR (Amb Doble RAG: Contingut + Pedagogia)
// ==========================================
async function handleGenerate(formData) {
    const apiKey = getApiKey();
    if (!apiKey) {
        alert('❗ Necessites una Clau API per continuar');
        sidebarApiKey.focus();
        return;
    }

    showLoading('Consultant experts...', 'Cercant al currículum i als marcs pedagògics...');

    try {
        if (sidebarProvider.value === 'gemini') {
            
            // --- CERCA 1: CONTINGUT (Què ensenyar) ---
            const queryContingut = `${formData.materia || ''} ${formData.tema || ''} ${formData.etapa || ''}`;
            const contextContingut = await cercarAlCurriculum(queryContingut, apiKey);
            
            // --- CERCA 2: PEDAGOGIA (Com ensenyar) ---
            const queryPedagogia = "principis disseny instruccional fricció cognitiva model 4d rols interacció ia pedagogia ignasiana";
            const contextPedagogic = await cercarAlCurriculum(queryPedagogia, apiKey);
            
            // --- INJECTEM TOT AL PROMPT ---
            let promptEnriquit = "";

            if (contextContingut) {
                promptEnriquit += `\n\n[MARC CURRICULAR OFICIAL]:\n${contextContingut}\n`;
            }

            if (contextPedagogic) {
                promptEnriquit += `\n\n[PRINCIPIS PEDAGÒGICS I METODOLÒGICS A SEGUIR]:\n${contextPedagogic}\n`;
            }

            if (promptEnriquit) {
                // Afegim tot el context al "tema" perquè l'orquestrador ho rebi com part de la instrucció
                formData.tema = (formData.tema || '') + promptEnriquit;
                console.log("📝 RAG Complet: Context injectat correctament.");
            }
        }

        loadingText.textContent = 'Generant proposta pedagògica...';
        
        // 2. Generació final
        const result = await orchestrate('generate', formData);
        showResult(result);

    } catch (error) {
        hideLoading();
        alert(`Error: ${error.message}`);
    }
}

// ==========================================
// 5. AUDITAR (Amb Doble RAG corregit)
// ==========================================
// --- AUDITAR (Handle Audit) - VERSIÓ MESTRA ---
async function handleAudit(params) {
    const apiKey = getApiKey();
    if (!apiKey) {
        alert('❗ Necessites una Clau API');
        sidebarApiKey.focus();
        return;
    }

    showLoading('Auditant activitat...', 'Analitzant criteris pedagògics complets...');

    try {
        let contextAudit = "";

        // 1. RAG AVANÇAT (Gemini)
        if (sidebarProvider.value === 'gemini') {
            
            // A. Context de la matèria (per saber si és adequada)
                console.log('🔍 DEBUG handleAudit - Inici');
    console.log('📋 Params rebuts:', JSON.stringify(params, null, 2));
            const queryContingut = `${params.subject || ''} ${params.stage || ''} currículum oficial`;
            const contextMateria = await cercarAlCurriculum(queryContingut, apiKey);
            
            // B. Context PEDAGÒGIC COMPLET (Tots els teus documents)
            // Afegim Inclusió, DUA, Fricció, Model 4D, Rols IA, Disseny Instruccional...
            const queryPedagogia = "inclusió educativa disseny universal aprenentatge dua fricció cognitiva productiva model 4d mihia rols interacció ia disseny instruccional avaluació formativa pedagogia ignasiana";
            const contextPedagogic = await cercarAlCurriculum(queryPedagogia, apiKey);
            
            if (contextMateria) contextAudit += `\n[CONTEXT CURRICULAR]:\n${contextMateria}\n`;
            if (contextPedagogic) contextAudit += `\n[MARCS TEÒRICS I CRITERIS DE QUALITAT]:\n${contextPedagogic}\n`;
        }

        // 2. INSTRUCCIÓ DE MILLORA OBLIGATÒRIA
        const instruccioFinal = `
        \n\n---------------------------------------------------
        INFORMACIÓ DE SUPORT PER A L'AUDITORIA:
        ${contextAudit}
        ---------------------------------------------------
        INSTRUCCIONS CRÍTIQUES PER A LA GENERACIÓ:
        1. Analitza l'activitat basant-te en els marcs teòrics anteriors (DUA, Inclusió, Fricció, etc.).
        2. IMPRESCINDIBLE: Genera una versió TOTALMENT REESCRITA I MILLORADA de l'activitat.
        3. La teva resposta HA DE SER UN JSON vàlid amb aquests camps exactes:
           - "analysis": { "strengths": [], "weaknesses": [], "suggestions": [] }
           - "improvedActivity": { "title": "...", "description": "...", "steps": [...] }
        ---------------------------------------------------
        `;

        // Injectem tot això dins del paràmetre que l'orquestrador envia a la IA
        // Preserva el text de l'usuari separat del context RAG
        params.activityText = params.activityText || "";  // ja ve del formulari
        params.ragContext = instruccioFinal;               // nou camp per al context

        console.log("📝 RAG Auditoria: Context complet (DUA + Inclusió + Pedagogia) injectat.");

        loadingText.textContent = 'Generant la proposta millorada...';
        
        // 3. Cridem l'orquestrador
                console.log('⚙️ Crida orchestrate amb:');
        console.log('  - activityText:', params.activityText?.substring(0, 100) + '...');
        console.log('  - stage:', params.stage);
        console.log('  - subject:', params.subject);
        console.log('  - ragContext length:', params.ragContext?.length);
        const result = await orchestrate('audit', {
            activityText: params.activityText,
            stage: params.stage,
            subject: params.subject,
            ragContext: params.ragContext
        });

                console.log('✅ Resultat rebut de orchestrate:');
        console.log('  - result.type:', result?.type);
        console.log('  - result.analysis:', !!result?.analysis);
        console.log('  - result.improvedActivity:', !!result?.improvedActivity);
        console.log('  - result.improvedProposal:', !!result?.improvedProposal);
        console.log('  - result.error:', result?.error);
        
        if (!result || result.error) {
            throw new Error(result?.error || "La IA no ha retornat cap resultat.");
        }

        // 4. Verificació de seguretat
        if (!result.improvedActivity && !result.improvedProposal) {
            console.warn("⚠️ Alerta: La IA ha fet l'auditoria però no ha retornat la millora.");
        }

                console.log('🎉 Cridant showResult amb el resultat final.');
        showResult(result);

    } catch (error) {
        hideLoading();
        console.error("Error Auditoria:", error);
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
        if (result.type === 'audit') {
            // Si estem auditant, tornem a la pantalla d'auditoria al tancar
             document.querySelector('[data-mode="audit"]').click();
        } else {
             // Si estem generant, tornem a la pantalla de generar
             document.querySelector('[data-mode="generate"]').click();
        }
    });
}

// Iniciem l'aplicació
init();
