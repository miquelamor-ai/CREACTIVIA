// CREACTIVITAT — Generator (Optimitzat: 2 crides en lloc de 3)
import { callLLM } from '../api/llm-provider.js';
import { loadSpecificKnowledge } from '../knowledge/loader.js';

// ─── STEP 1: GENERA L'ACTIVITAT COMPLETA ───────────────────────────────────
export async function generateActivity(params) {
  const knowledge = await loadSpecificKnowledge(['disseny', 'mihia', 'rols']);

  const prompt = `Ets CREACTIVITAT, expert en disseny pedagògic d'activitats amb IA.

=== MARCS DE REFERÈNCIA ===
${knowledge}

=== PETICIÓ ===
Tipus: ${params.granularity || 'activitat'}
Etapa: ${params.stage || 'ESO'}
Matèria: ${params.subject}
Tema: ${params.topic}
Nivell de coneixement: ${params.knowledgeLevel || 'inicial'}
Objectiu: ${params.objective}
Durada: ${params.duration || '1 sessió'}
MIHIA preferit: ${params.mihiaPreferred || 'Automàtic (tria el millor)'}
Rol IA preferit: ${params.rolePreferred || 'Automàtic (tria el millor)'}

=== TASCA CRÍTICA D'EXPERT ===
- LLENGUA: Utilitza EXCLUSIVAMENT el CATALÀ. Està prohibit l'ús de qualsevol altra llengua o castellanismes.
- RIGOR PEDAGÒGIC: Adapta el contingut amb precisió quirúrgica a l'etapa "${params.stage}" i al nivell de coneixements "${params.knowledgeLevel || 'inicial'}".
- DIFICULTAT: No demanis als alumnes que facin coses que no corresponen a la seva edat. Simplifica si cal, o augmenta el repte si és aprofundiment.
- CRITERIS DE VALIDACIÓ: Els criteris d'avaluació han de ser clars, observables i ASSOLIBLES per als alumnes en la sessió proposada.
- FORMAT: Utilitza **negretes** per ressaltar de forma clara què faran els alumnes i què faran amb la IA (frases o paraules clau).
- AVIS LEGAL: Si els alumnes són menors d'edat (Primària/ESO), recorda la necessitat d'autorització i supervisió.

Per a cada fase de la seqüència, descriu:
- "docent": Accions del docent com llista de punts (comença cada punt amb "- ")
- "alumne": Accions de l'alumne com llista de punts. **Ressalta accions clau en negreta.**
- "ia": Rol i accions de la IA. **Ressalta accions clau de la IA en negreta.**
- "referencia": Justificació pedagògica de la fase (1-2 frases referenciades als marcs)
- "usaIA": true/false
- "proto": nivells de protagonisme 0-100 {"doc": X, "alu": Y, "ia": Z}

=== FORMAT DE RESPOSTA (JSON estricte, sense cap text fora del JSON) ===
{
  "titol": "Títol breu i atractiu",
  "resum": "Descripció de 2-3 frases de l'activitat. Pots usar **negretes** per ressaltar paraules clau.",
  "metadata": {
    "etapa": "${params.stage}",
    "materia": "${params.subject}",
    "tema": "${params.topic}",
    "nivell": "${params.knowledgeLevel || 'inicial'}",
    "granularitat": "${params.granularity || 'activitat'}",
    "durada": "${params.duration || '1 sessió'}"
  },
  "objectiu": "L'objectiu d'aprenentatge reformulat",
  "previ": {
    "ia_config": "Quin tipus de IA usar, configuració i eines",
    "prompt_sistema": "Text del prompt de sistema o instruccions clau per configurar la IA si cal",
    "guardrails": "Límits de seguretat, comportaments prohibits i protecció de dades",
    "preparacio_docent": "Què ha de preparar el docent (compte, materials, autorització)",
    "preparacio_alumne": "Què han de saber/fer els alumnes abans de començar"
  },
  "mihia": {
    "nivell": 2,
    "nom": "Nom del nivell",
    "justificacio": "Per què aquest nivell és adequat"
  },
  "rolIA": {
    "principal": "Nom del rol principal",
    "descripcio": "Com actua la IA en aquesta activitat",
    "justificacio": "Per què aquest rol és el més adient"
  },
  "sequencia": [
    {
      "fase": "Nom de la fase",
      "durada": "X min",
      "docent": "- Acció 1\\n- Acció 2",
      "alumne": "- Acció 1 amb **negreta**\\n- Acció 2",
      "ia": "- Rol: [Nom]\\n- Acció amb **negreta**",
      "referencia": "Justificació pedagògica de la fase",
      "usaIA": true,
      "proto": {"doc": 30, "alu": 60, "ia": 10}
    }
  ],
  "avaluacio": {
    "criteris": "- Criteri 1\\n- Criteri 2",
    "estrategies": "Estratègies d'avaluació formativa i formadora",
    "feedback": "Com es donarà el feedback i si hi ha rúbrica"
  },
  "competencies4D": {
    "D1_delegacio": {"activa": true, "detall": "Com es treballa"},
    "D2_descripcio": {"activa": true, "detall": "Com es treballa"},
    "D3_discerniment": {"activa": false, "detall": "Per què no s'inclou"},
    "D4_diligencia": {"activa": false, "detall": "Per què no s'inclou"}
  },
  "sempieza": {
    "nivell": "verd",
    "resum": "L'activitat promou fricció productiva",
    "justificacio": "Justificació detallada del semàfor"
  },
  "reflexio_ppi": {
    "moment": "Final de la sessió",
    "pregunta": "Pregunta de reflexió sense IA"
  },
  "inclusio": {
    "dua_aplicat": "Com s'aplica el Disseny Universal",
    "adaptacions": "Adaptacions possibles"
  },
  "riscos": ["Risc potencial 1 si n'hi ha (autorització si s'aplica)"],
  "recomanacions_docent": "Consells pràctics per al docent"
}`;

  const result = await callLLM(prompt, { temperature: 0.7 });
  return normalizeResult(result, 'activitat');
}

// ─── STEP 2: AUDITORIA PEDAGÒGICA ──────────────────────────────────────────
export async function auditGeneratedActivity(activity) {
  const knowledge = await loadSpecificKnowledge(['friccio']);

  const prompt = `Ets CREACTIVITAT-AUDITOR, expert en qualitat pedagògica d'activitats amb IA.

=== MARC DE FRICCIÓ COGNITIVA ===
${knowledge}

=== ACTIVITAT A AUDITAR ===
${JSON.stringify(activity, null, 2)}

=== TASCA ===
Audita la qualitat pedagògica d'aquesta activitat de forma crítica i constructiva.

=== FORMAT (JSON estricte) ===
{
  "semafor": {
    "nivell": "verd|groc|vermell",
    "resum": "Diagnòstic en 1 frase",
    "justificacio": "Justificació de 2-3 frases"
  },
  "punts_forts": ["Punt fort 1", "Punt fort 2"],
  "riscos": [
    {
      "tipus": "Rendició Cognitiva|Skill Decay|Delegació excessiva|...",
      "severitat": "alta|mitjana|baixa",
      "descripcio": "Descripció del risc",
      "on": "En quina fase/moment"
    }
  ],
  "millores": [
    {
      "prioritat": "alta|mitjana|baixa",
      "descripcio": "Millora concreta",
      "com": "Com implementar-la",
      "marc_referencia": "Marc pedagògic que la sustenta"
    }
  ],
  "veredicte": "Resum final de 2-3 frases amb la valoració global i recomanació principal"
}`;

  const result = await callLLM(prompt, { temperature: 0.3 });
  return normalizeResult(result, 'auditoria');
}

// ─── GENERATE IMPROVED (per auditoria externa) ─────────────────────────────
export async function generateImprovedActivity(originalText, auditResults, params = {}) {
  const knowledge = await loadSpecificKnowledge(['friccio', 'mihia', 'rols', 'disseny']);

  const prompt = `Ets CREACTIVITAT, expert en redisseny pedagògic.
Reescriu l'activitat original aplicant les millores de l'auditoria.

=== CONTEXT PEDAGÒGIC ===
${knowledge}

=== ACTIVITAT ORIGINAL ===
${originalText}

=== INFORME D'AUDITORIA ===
${JSON.stringify(auditResults, null, 2)}

=== FORMAT (JSON estricte, igual que l'activitat original) ===
Retorna el JSON complet de l'activitat millorada amb el mateix format que generateActivity.
No incloguis text fora del JSON.`;

  const result = await callLLM(prompt, { temperature: 0.7 });
  return normalizeResult(result, 'activitat');
}

// ─── MANTENIM COMPATIBILITAT AMB NOMS ANTICS ───────────────────────────────
export async function generateSkeleton(params) {
  return generateActivity(params);
}

export async function enrichWithPedagogy(draft) {
  // Ja no cal pas separat, retornem el draft
  return draft;
}

export async function finalizeActivity(draft) {
  if (!draft || !draft.titol || !draft.sequencia) {
    throw new Error("L'activitat generada és incompleta. Torna-ho a provar.");
  }
  if (!draft.inclusio) draft.inclusio = { dua_aplicat: 'Suport general', adaptacions: 'Flexible' };
  if (!draft.reflexio_ppi) draft.reflexio_ppi = { moment: 'Final', pregunta: 'Què has après avui?' };
  return draft;
}

// ─── NORMALITZAR RESULTAT ──────────────────────────────────────────────────
function normalizeResult(result, type) {
  if (!result) throw new Error('Resposta buida del model');

  if (result.rawText) {
    // Intentar extreure JSON del text
    const text = result.rawText;

    // Provar blocs ```json
    const jsonBlock = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (jsonBlock) {
      try { return JSON.parse(jsonBlock[1]); } catch { /* continua */ }
    }

    // Provar primer objecte JSON complet
    const objectMatch = text.match(/(\{[\s\S]*\})/);
    if (objectMatch) {
      try { return JSON.parse(objectMatch[1]); } catch { /* continua */ }
    }

    console.error(`[Generator] No s'ha pogut parsejar JSON (${type}):`, text.substring(0, 500));
    return {
      error: `El model ha retornat text en format incorrecte. Torna-ho a provar.`,
      rawText: text.substring(0, 200)
    };
  }

  return result;
}
