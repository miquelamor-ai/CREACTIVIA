// CREACTIVITAT — Skill: Generador d'Activitats
import { callGemini } from '../api/gemini.js';
import { getKnowledgeContext } from '../knowledge/loader.js';

/**
 * Generate a didactic proposal based on teacher input.
 * @param {object} params - Wizard form data
 * @returns {Promise<object>} - Structured activity proposal
 */
export async function generateActivity(params) {
  const knowledge = await getKnowledgeContext('generate');

  const prompt = buildGeneratorPrompt(params, knowledge);
  const result = await callGemini(prompt, { temperature: 0.7 });

  // Validate and normalize the result
  return normalizeResult(result, params);
}

function buildGeneratorPrompt(params, knowledge) {
  const { granularity, duration, stage, subject, topic, objective, mihiaPreferred, rolePreferred } = params;

  return `Ets CREACTIVITAT, un sistema expert en disseny d'activitats educatives que integren la Intel·ligència Artificial. Has de generar una proposta didàctica basada en els marcs pedagògics que se't proporcionen.

=== MARCS PEDAGÒGICS DE REFERÈNCIA ===
${knowledge}

=== PETICIÓ DEL DOCENT ===
- Tipus de proposta: ${granularity || 'activitat'}
- Durada: ${duration || '1 sessió'}
- Etapa educativa: ${stage || 'ESO'}
- Matèria: ${subject || 'No especificada'}
- Tema / contingut: ${topic || 'No especificat'}
- Objectiu d'aprenentatge: ${objective || 'No especificat'}
${mihiaPreferred ? `- Nivell MIHIA preferit: ${mihiaPreferred}` : ''}
${rolePreferred ? `- Rol IA preferit: ${rolePreferred}` : ''}

=== INSTRUCCIONS DE GENERACIÓ ===

1. GENERA una proposta del tipus "${granularity || 'activitat'}" que respecti TOTS els marcs pedagògics.
2. ASSIGNA un nivell MIHIA adequat (0-5) i justifica'l.
3. ASSIGNA un o més rols IA dels 7 disponibles i justifica'ls.
4. APLICA el Model de Responsabilitat Gradual (Fisher & Frey) segons la durada.
5. INCLOU un moment de REFLEXIÓ sense IA (pedagogia ignasiana - PPI).
6. AVALUA el Semàfor de Fricció de la proposta (🔴🟡🟢).
7. IDENTIFICA quines competències 4D treballa la proposta (D1-D4).
8. CONNECTA amb competències CDA (CD1-CD5) si escau.
9. APLICA criteris d'inclusió (DUA).

=== FORMAT DE RESPOSTA (JSON estricte) ===

Respon EXCLUSIVAMENT amb un objecte JSON amb aquesta estructura:

{
  "titol": "Títol de l'activitat",
  "resum": "Resum breu de la proposta (2-3 frases)",
  "granularitat": "${granularity || 'activitat'}",
  "durada": "${duration || '1 sessió'}",
  "etapa": "${stage || 'ESO'}",
  "materia": "${subject || ''}",
  "tema": "${topic || ''}",
  "objectiu": "${objective || ''}",
  
  "sempieza": {
    "nivell": "verd|groc|vermell",
    "justificacio": "Per què aquest nivell de semàfor"
  },
  
  "mihia": {
    "nivell": 0,
    "nom": "Nom del nivell",
    "justificacio": "Per què aquest nivell MIHIA"
  },
  
  "rolIA": {
    "principal": "Nom del rol",
    "descripcio": "Què fa la IA en aquest rol",
    "justificacio": "Per què aquest rol",
    "secundari": "Rol secundari (opcional, pot ser null)"
  },
  
  "competencies4D": {
    "D1_delegacio": { "activa": true, "detall": "Com es treballa" },
    "D2_descripcio": { "activa": true, "detall": "Com es treballa" },
    "D3_discerniment": { "activa": true, "detall": "Com es treballa" },
    "D4_diligencia": { "activa": false, "detall": "" }
  },
  
  "competenciesCDA": ["CD1", "CD3"],
  
  "grr": {
    "fase_predominant": "Nosaltres fem",
    "progressio": "Detall de la progressió GRR si aplica"
  },
  
  "sequencia": [
    {
      "fase": "Nom de la fase (ex: Inici, Desenvolupament, Tancament)",
      "durada": "Temps estimat",
      "descripcio": "Què passa en aquesta fase",
      "usaIA": true,
      "mihia_fase": 0,
      "instruccions_alumne": "Què ha de fer l'alumne",
      "instruccions_docent": "Què ha de fer el docent",
      "prompt_alumne": "Prompt que l'alumne usarà amb la IA (si usaIA=true)"
    }
  ],
  
  "reflexio_ppi": {
    "moment": "En quina fase es fa la reflexió",
    "pregunta": "Pregunta de reflexió per a l'alumne"
  },
  
  "inclusio": {
    "dua_aplicat": "Com s'aplica DUA",
    "adaptacions": "Adaptacions suggerides per diversitat"
  },
  
  "evidencia_aprenentatge": "Com es demostra que l'alumne ha après",
  
  "riscos": ["Risc 1 a vigilar", "Risc 2"],
  
  "recomanacions_docent": "Consells per al docent"
}`;
}

function normalizeResult(result, params) {
  // If result has rawText, it means JSON parsing failed at the API level
  if (result.rawText) {
    try {
      // Try to extract JSON from markdown code blocks
      const match = result.rawText.match(/```json?\s*([\s\S]*?)\s*```/);
      if (match) {
        return JSON.parse(match[1]);
      }
      // Try direct parse
      return JSON.parse(result.rawText);
    } catch {
      return {
        error: true,
        rawText: result.rawText,
        titol: 'Error de format',
        resum: 'La resposta no ha pogut ser processada correctament.',
      };
    }
  }
  return result;
}
