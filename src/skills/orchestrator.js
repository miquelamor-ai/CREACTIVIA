// CREACTIVITAT — Orchestrator (Simplificat: 2 crides LLM)
import { CONFIG } from '../config.js';
import { generateActivity, auditGeneratedActivity, generateImprovedActivity } from './generator.js';
import { auditActivity } from './auditor.js';

export async function orchestrate(mode, params) {
  if (mode === 'generate') return await runGenerate(params);
  if (mode === 'audit') return await runAudit(params);
  throw new Error(`Mode desconegut: ${mode}`);
}

// ─── MODE GENERA: 2 crides LLM ─────────────────────────────────────────────
async function runGenerate(params) {
  try {
    // CRIDA 1: Genera l'activitat completa
    console.log('🎯 [1/2] Generant activitat...');
    const activity = await generateActivity(params);
    
    if (!activity || activity.error) {
        throw new Error(activity?.error || "Error generant l'activitat inicial.");
    }

    // Pausa entre crides per respectar rate limit
    await delay(2000);

    // CRIDA 2: Auditoria pedagògica de l'activitat generada
    console.log('🔍 [2/2] Auditant qualitat pedagògica...');
    const audit = await auditGeneratedActivity(activity);

    return {
      mode: 'generate',
      activity,
      audit,
      timestamp: Date.now(),
      modelUsed: CONFIG.MODEL,
      inputParams: { ...params }
    };

  } catch (error) {
    console.error('[Orchestrator] Error en generació:', error);
    return { error: error.message };
  }
}

// ─── MODE AUDITA: 2 crides LLM (CORREGIT) ──────────────────────────────────
async function runAudit(params) {
  try {
    // 1. Validem que hi hagi text per auditar
    // L'usuari escriu a 'activityDescription' (al formulari d'auditoria)
    const textToAudit = params.activityText || params.activityDescription || "";
    
    if (!textToAudit) {
        throw new Error("No s'ha introduït cap activitat per auditar.");
    }

    // CRIDA 1: Auditoria de l'activitat existent
    console.log('🔍 [1/2] Auditant activitat...');
    const audit = await auditActivity({ ...params, activityText: textToAudit });
    
    if (!audit || audit.error) {
        throw new Error(audit?.error || "Error durant l'anàlisi de l'activitat.");
    }

    await delay(3000);

    // CRIDA 2: Generar versió millorada
    console.log('🎯 [2/2] Generant versió millorada...');
    
    // Passem el text original + l'auditoria feta + el context extra (RAG)
    const improvedActivity = await generateImprovedActivity(textToAudit, audit, params);

    return {
      mode: 'audit',
      activity: improvedActivity, // Això serà la "Nova Proposta"
      audit: audit,               // Això serà l'anàlisi crític
      timestamp: Date.now(),
      modelUsed: CONFIG.MODEL,
      inputParams: { ...params }
    };

  } catch (error) {
    console.error('[Orchestrator] Error en auditoria:', error);
    return { error: error.message };
  }
}

function delay(ms) {
  return new Promise(r => setTimeout(r, ms));
}
