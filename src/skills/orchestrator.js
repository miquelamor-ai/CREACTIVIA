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
    if (activity.error) throw new Error(activity.error);

    // Pausa entre crides per respectar rate limit
    await delay(3000);

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
    return {
      mode: 'generate',
      activity: null,
      audit: null,
      error: error.message,
      timestamp: Date.now(),
      modelUsed: CONFIG.MODEL,
      inputParams: { ...params }
    };
  }
}

// ─── MODE AUDITA: 2 crides LLM ─────────────────────────────────────────────
async function runAudit(params) {
  try {
    // CRIDA 1: Auditoria de l'activitat existent
    console.log('🔍 [1/2] Auditant activitat...');
    const audit = await auditActivity(params);
    if (audit.error) throw new Error(audit.error);

    await delay(3000);

    // CRIDA 2: Generar versió millorada
    console.log('🎯 [2/2] Generant versió millorada...');
    const improvedActivity = await generateImprovedActivity(params.activityText, audit, params);

    return {
      mode: 'audit',
      activity: improvedActivity,
      audit,
      timestamp: Date.now(),
      modelUsed: CONFIG.MODEL,
      inputParams: { ...params }
    };

  } catch (error) {
    console.error('[Orchestrator] Error en auditoria:', error);
    return {
      mode: 'audit',
      activity: null,
      audit: null,
      error: error.message,
      timestamp: Date.now(),
      modelUsed: CONFIG.MODEL,
      inputParams: { ...params }
    };
  }
}

function delay(ms) {
  return new Promise(r => setTimeout(r, ms));
}
