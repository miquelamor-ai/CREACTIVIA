// CREACTIVITAT — Skill: Generator (Quality Chain)
import { callLLM } from '../api/llm-provider.js';
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
  
  PER A CADA FASE, utilitza aquests MARCS per definir les columnes:
  1. DOCENT (Rols d'acció): Modelatge, Orquestració, Feedback, Validació, Monitorització.
  2. ALUMNE (Taxonomia de Bloom): Exploració, Planificació, Creació, Avaluació Crítica, Reflexió.
  3. IA (Rols de Mollick): Mentor, Tutor, Coach, Companys, Simulador, Alumne, Eina.
  
  REGLA DE FORMAT:
  - Descriu les accions de cada rol com una llista de punts començant per "-".
  - Sigues concret i accionable.

  FORMAT JSON:
  { 
    "titol": "...", 
    "resum": "...", 
    "etapa": "${params.stage}",
    "materia": "${params.subject}",
    "tema": "${params.topic}",
    "objectiu": "...", 
    "sequencia": [
      { 
        "fase": "...", 
        "durada": "...", 
        "docent": "- Acctio 1\\n- Accio 2", 
        "alumne": "- Accio 1\\n- Accio 2", 
        "ia": "- Rol: [Nom]\\n- Accio 1", 
        "referencia": "...",
        "proto": { "doc": 0-100, "alu": 0-100, "ia": 0-100 }
      }
    ] 
  }
  `;

  const result = await callLLM(prompt, { temperature: 0.7 });
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
  3. Revisa la seqüència paral·lela (docent, alumne, ia, referencia).
  4. Assegura't que les descripcions de "docent", "alumne" i "ia" són LLISTES DE PUNTS ("- ...").
  5. Assigna nivells de PROTAGONISME (0-100) realistes per a cada rol a cada fase ("proto": { "doc": X, "alu": Y, "ia": Z }).
  6. Marca "usaIA": true en les fases on la columna "ia" tingui un paper actiu.
  7. Afegeix "competencies4D" i "sempieza" (Semàfor de Fricció).
  
  Retorna el JSON complet enriquit.
  `;

  const result = await callLLM(prompt, { temperature: 0.7 });
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

// --- STEP 4: IMPROVE FROM AUDIT ---
export async function generateImprovedActivity(originalText, auditResults, params = {}) {
  const knowledge = await loadSpecificKnowledge(['friccio', 'mihia', 'rols', 'disseny']);

  const prompt = `
  Ets CREACTIVITAT, expert en redisseny pedagògic.
  Has de REESCRIURE l'activitat original per solucionar els problemes detectats a l'auditoria.
  
  CONTEXT PEDAGÒGIC:
  ${knowledge}
  
  ACTIVITAT ORIGINAL:
  ${originalText}
  
  INFORME D'AUDITORIA:
  ${JSON.stringify(auditResults)}
  
  OBJECTIU:
  Crea una versió MILLORADA que augmenti la fricció productiva, redueixi el risc de delegació i incorpori les millores suggerides.
  L'activitat ha de seguir l'estructura estàndard de CREACTIVITAT (títol, resum, MIHIA, Rol IA, seqüència, 4D, PPI, inclusió).
  
  FORMAT JSON (estricte):
  { "titol": "...", "resum": "...", "mihia": { "nivell": ... }, "rolIA": { ... }, "sequencia": [...], ... }
  `;

  const result = await callLLM(prompt, { temperature: 0.7 });
  return normalizeResult(result);
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
