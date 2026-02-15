// CREACTIVITAT — Skill: Auditor Cognitiu
import { callGemini } from '../api/gemini.js';
import { loadSpecificKnowledge } from '../knowledge/loader.js';

/**
 * Audit an existing activity for pedagogical quality.
 * @param {object} params - Activity text and optional context
 * @returns {Promise<object>} - Audit results with semaphore, risks, improvements
 */
export async function auditActivity(params) {
  // Load specific knowledge for auditing
  const knowledge = await loadSpecificKnowledge(['friccio', 'etic', 'mihia']);

  const prompt = buildAuditPrompt(params, knowledge);
  const result = await callGemini(prompt, { temperature: 0.4 });

  return normalizeAuditResult(result);
}

function buildAuditPrompt(params, knowledge) {
  const { activityText, stage, subject } = params;

  return `Ets CREACTIVITAT-AUDITOR, un sistema expert en anàlisi pedagògica d'activitats educatives amb IA. Has d'auditar l'activitat que t'envia el docent basant-te en els marcs pedagògics de referència.

=== MARCS PEDAGÒGICS DE REFERÈNCIA ===
${knowledge}

=== ACTIVITAT A AUDITAR ===
${activityText}

${stage ? `Etapa educativa: ${stage}` : ''}
${subject ? `Matèria: ${subject}` : ''}

=== INSTRUCCIONS D'AUDITORIA ===

Analitza l'activitat segons aquests criteris:

1. **SEMÀFOR DE FRICCIÓ** (🔴🟡🟢):
   - 🔴 STOP: L'alumne delega el pensament a la IA sense fricció productiva
   - 🟡 ATENCIÓ: Hi ha elements de fricció però també riscos de delegació
   - 🟢 GO: L'activitat promou fricció productiva, l'alumne pensa activament

2. **RENDICIÓ COGNITIVA**: Detecta si l'alumne pot caure en acceptar resultats sense escrutini
3. **SKILL DECAY**: Si l'alumne fa aquesta activitat 10 vegades, millorarà o perdrà habilitats?
4. **4D**: Quines dimensions del Model 4D es treballen?
5. **MIHIA**: A quin nivell d'interacció humà-IA correspon?
6. **PPI**: Hi ha moment de reflexió autònoma (sense IA)?
7. **INCLUSIÓ**: L'activitat és accessible per a tot l'alumnat?
8. **PRINCIPIS RECTORS**: Respecta els 5 valors institucionals?

=== FORMAT DE RESPOSTA (JSON estricte) ===

{
  "semafor": {
    "nivell": "verd|groc|vermell",
    "resum": "Diagnòstic en 1-2 frases",
    "justificacio": "Justificació detallada"
  },
  
  "mihia_detectat": {
    "nivell": 0,
    "nom": "Nom del nivell",
    "adequat": true,
    "comentari": "Comentari sobre l'adequació"
  },
  
  "competencies4D": {
    "D1_delegacio": { "present": true, "comentari": "" },
    "D2_descripcio": { "present": false, "comentari": "" },
    "D3_discerniment": { "present": false, "comentari": "" },
    "D4_diligencia": { "present": false, "comentari": "" }
  },
  
  "riscos": [
    {
      "tipus": "Nom del risc (ex: Rendició Cognitiva, Skill Decay, Delegació excessiva...)",
      "severitat": "alta|mitjana|baixa",
      "descripcio": "Descripció del risc",
      "on": "En quin punt de l'activitat es dona"
    }
  ],
  
  "punts_forts": [
    "Punt fort 1",
    "Punt fort 2"
  ],
  
  "millores": [
    {
      "prioritat": "alta|mitjana|baixa",
      "descripcio": "Descripció de la millora",
      "com": "Com implementar-la concretament",
      "marc_referencia": "Quin marc pedagògic la sustenta"
    }
  ],
  
  "reflexio_ppi": {
    "present": false,
    "comentari": "Hi ha moment de reflexió sense IA?",
    "suggeriment": "Com afegir-lo si no hi és"
  },
  
  "inclusio": {
    "adequada": true,
    "comentari": "Comentari sobre accessibilitat i inclusió",
    "suggeriments": ["Suggeriment 1"]
  },
  
  "principis_rectors": {
    "compliment": "alt|mig|baix",
    "alertes": ["Alerta si algun principi no es respecta"]
  },
  
  "veredicte": "Resum final de l'auditoria (3-4 frases) amb la recomanació principal"
}`;
}

function normalizeAuditResult(result) {
  if (result.rawText) {
    try {
      const match = result.rawText.match(/```json?\s*([\s\S]*?)\s*```/);
      if (match) return JSON.parse(match[1]);
      return JSON.parse(result.rawText);
    } catch {
      return {
        error: true,
        rawText: result.rawText,
        semafor: { nivell: 'groc', resum: 'Error processant auditoria' },
      };
    }
  }
  return result;
}
