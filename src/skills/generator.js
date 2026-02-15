// CREACTIVITAT — Skill: Generator (Quality Chain)
import { callGemini } from '../api/gemini.js';
import { loadSpecificKnowledge } from '../knowledge/loader.js';

// --- STEP 1: SKELETON ---
export async function generateSkeleton(params) {
  const knowledge = await loadSpecificKnowledge(['disseny']); // Only Design framework

  const prompt = `
  Ets CREACTIVITAT, expert en disseny instruccional.
  Genera l'ESQUELET d'una proposta didàctica.
  
  CONTEXT:
  ${knowledge}
  
  PETICIÓ:
  - Tipus: ${params.granularity}
  - Etapa: ${params.stage}, Matèria: ${params.subject}, Tema: ${params.topic}
  - Objectiu: ${params.objective}
  - Durada: ${params.duration}

  TASCA:
  Crea l'estructura JSON amb títol, resum, objectiu i la seqüència didàctica (fases).
  No et preocupis encara per la IA ni el model 4D. Centra't en la pedagogia base.
  
  FORMAT JSON:
  { "titol": "...", "resum": "...", "objectiu": "...", "sequencia": [...] }
  `;

  const result = await callGemini(prompt, { temperature: 0.7 });
  return normalizeResult(result);
}

// --- STEP 2: ENRICHMENT ---
export async function enrichWithPedagogy(draft, params) {
  const knowledge = await loadSpecificKnowledge(['mihia', 'rols', 'friccio']); // AI frameworks

  const prompt = `
  Ets CREACTIVITAT. Ara has d'enriquir aquest esborrany amb PEDAGOGIA IA AVANÇADA.
  
  MARCS TEÒRICS:
  ${knowledge}
  
  ESBORRANY ACTUAL:
  ${JSON.stringify(draft)}
  
  PREFERÈNCIES:
  - MIHIA: ${params.mihiaPreferred || 'Auto'}
  - Rol: ${params.rolePreferred || 'Auto'}
  
  TASCA:
  1. Defineix el nivell MIHIA i Rol IA.
  2. Afegeix el camp "rolIA" i "mihia" al JSON.
  3. Revisa la seqüència i marca on s'usa la IA (usaIA: true) i on NO (reflexió).
  4. Afegeix "competencies4D" i "sempieza" (Semàfor de Fricció).
  
  Retorna el JSON complet enriquit.
  `;

  const result = await callGemini(prompt, { temperature: 0.7 });
  return normalizeResult(result);
}

// --- STEP 3: POLISH ---
export async function finalizeActivity(enrichedDraft) {
  // This step ensures the JSON is perfectly formatted and adds final structural fields if missing
  // Paradoxically, we don't need a heavy AI call here, just a check or a light call.
  // For cost saving, we might skip a 3rd call if step 2 is good.
  // Let's assume step 2 returns the final object, but we validate it here.

  if (!enrichedDraft.titol || !enrichedDraft.sequencia) {
    throw new Error("L'esborrany final és incomplet.");
  }

  // Ensure strict fields exists
  if (!enrichedDraft.inclusio) enrichedDraft.inclusio = { dua_aplicat: "Generat automàticament", adaptacions: "Suport general" };
  if (!enrichedDraft.reflexio_ppi) enrichedDraft.reflexio_ppi = { moment: "Final", pregunta: "Què has après?" };

  return enrichedDraft;
}

function normalizeResult(result) {
  if (result.rawText) {
    try {
      const match = result.rawText.match(/```json?\s*([\s\S]*?)\s*```/);
      if (match) return JSON.parse(match[1]);
      return JSON.parse(result.rawText);
    } catch {
      return { error: "Error de format JSON IA", rawText: result.rawText };
    }
  }
  return result;
}
