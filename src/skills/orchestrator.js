// CREACTIVITAT — Orchestrator
import { generateActivity } from './generator.js';
import { auditActivity } from './auditor.js';

/**
 * Orchestrate the generation or auditing of an activity.
 * @param {'generate'|'audit'} mode
 * @param {object} params - Input parameters from the UI
 * @returns {Promise<object>} - Result with activity and/or audit data
 */
export async function orchestrate(mode, params) {
    if (mode === 'generate') {
        return await runGeneration(params);
    } else if (mode === 'audit') {
        return await runAudit(params);
    }
    throw new Error(`Mode desconegut: ${mode}`);
}

/**
 * Generate an activity and then auto-audit it.
 */
async function runGeneration(params) {
    // Step 1: Generate the activity
    const activity = await generateActivity(params);

    if (activity.error) {
        return { mode: 'generate', activity, audit: null, error: true };
    }

    // Step 2: Auto-audit the generated activity
    let audit = null;
    try {
        const activityText = formatActivityForAudit(activity);
        audit = await auditActivity({
            activityText,
            stage: params.stage,
            subject: params.subject,
        });
    } catch (e) {
        console.warn('Auto-audit failed, returning activity without audit:', e);
    }

    return { mode: 'generate', activity, audit };
}

/**
 * Audit an existing activity.
 */
async function runAudit(params) {
    const audit = await auditActivity(params);
    return { mode: 'audit', activity: null, audit };
}

/**
 * Convert a structured activity to text for the auditor to analyze.
 */
function formatActivityForAudit(activity) {
    const parts = [
        `Títol: ${activity.titol || 'Sense títol'}`,
        `Resum: ${activity.resum || ''}`,
        `Granularitat: ${activity.granularitat || 'activitat'}`,
        `Durada: ${activity.durada || '1 sessió'}`,
        `Etapa: ${activity.etapa || ''}`,
        `Matèria: ${activity.materia || ''}`,
        `Objectiu: ${activity.objectiu || ''}`,
        '',
        'Seqüència didàctica:',
    ];

    if (activity.sequencia && Array.isArray(activity.sequencia)) {
        activity.sequencia.forEach((fase, i) => {
            parts.push(`\nFase ${i + 1}: ${fase.fase || ''} (${fase.durada || ''})`);
            parts.push(`  Descripció: ${fase.descripcio || ''}`);
            parts.push(`  Usa IA: ${fase.usaIA ? 'Sí' : 'No'}`);
            if (fase.instruccions_alumne) parts.push(`  Instruccions alumne: ${fase.instruccions_alumne}`);
            if (fase.prompt_alumne) parts.push(`  Prompt alumne: ${fase.prompt_alumne}`);
        });
    }

    return parts.join('\n');
}
