// CREACTIVITAT — Skill: Orchestrator (Quality Chain Architecture)
import { generateSkeleton, enrichWithPedagogy, finalizeActivity, generateImprovedActivity } from './generator.js';
import { auditActivity } from './auditor.js';

/**
 * Orchestrate the generation or auditing of an activity.
 * @param {'generate'|'audit'} mode
 * @param {object} params - Input parameters from the UI
 * @returns {Promise<object>} - Result with activity and/or audit data
 */
export async function orchestrate(mode, params) {
    if (mode === 'generate') {
        return await runQualityChain(params);
    } else if (mode === 'audit') {
        return await runAudit(params);
    }
    throw new Error(`Mode desconegut: ${mode}`);
}

/**
 * Execute the Quality Chain Generation Process.
 * Step 1: Skeleton (Structure)
 * Step 2: Enrichment (Pedagogical Depth)
 * Step 3: Polish (Final Format)
 */
async function runQualityChain(params) {
    try {
        // 1. GENERATE SKELETON
        // Focus: Format, basic content, didactic sequence.
        // Context: Instructional Design only.
        console.log('🔗 Step 1: Skeleton Generation...');
        let draft = await generateSkeleton(params);
        if (draft.error) throw new Error(draft.error);

        // DELAY: Respect Free Rate Limit (15 RPM = 1 req / 4s)
        console.log('⏳ Waiting 4s for API rate limit safety...');
        await new Promise(resolve => setTimeout(resolve, 4000));

        // 2. PEDAGOGICAL ENRICHMENT (The "Quality" step)
        // Focus: Injecting 4D, MIHIA, and Roles deep knowledge.
        // Context: 4D Model + AI Roles.
        console.log('🔗 Step 2: Pedagogical Enrichment...');
        let enriched = await enrichWithPedagogy(draft, params);

        // 3. FINAL POLISH (The "Reliability" step)
        // Focus: JSON structure, ensuring everything is complete.
        console.log('🔗 Step 3: Final Polish...');
        const finalActivity = await finalizeActivity(enriched);

        return { mode: 'generate', activity: finalActivity, audit: null };

    } catch (error) {
        console.error('Quality Chain Failed:', error);
        return {
            mode: 'generate',
            activity: null,
            audit: null,
            error: `Error en la cadena de generació: ${error.message}`
        };
    }
}

async function runAudit(params) {
    try {
        // 1. Run Audit
        console.log('🔍 Executing Pedagogical Audit...');
        const audit = await auditActivity(params);

        // DELAY: Rate Limit Safety
        console.log('⏳ Waiting 4s before generating modified proposal...');
        await new Promise(resolve => setTimeout(resolve, 4000));

        // 2. Generate Modified Proposal based on Audit
        console.log('🎯 Generating Improved Proposal...');
        const modifiedActivity = await generateImprovedActivity(params.activityText, audit, params);

        return {
            mode: 'audit',
            activity: modifiedActivity,
            audit: audit
        };
    } catch (error) {
        console.error('Audit Chain Failed:', error);
        return {
            mode: 'audit',
            activity: null,
            audit: null,
            error: `Error en la auditoria: ${error.message}`
        };
    }
}
