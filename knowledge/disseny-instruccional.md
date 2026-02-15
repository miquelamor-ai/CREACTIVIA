# Disseny Instruccional i Seqüències Didàctiques

> Document de referència per als skills: Generador d'Activitats, Adaptador de Nivell

---

## 1. Jerarquia de Granularitat Didàctica

El docent pot demanar a l'app que generi propostes de **diferent abast**. Cada nivell de granularitat implica una estructura, durada i integració IA diferent:

### Escala de Granularitat

| Granularitat | Definició | Durada típica | Estructura | Integració IA |
|---|---|---|---|---|
| **Exercici** | Tasca curta i concreta, amb objectiu únic | 5-20 min | Una sola instrucció + resposta | Un sol rol IA, un sol MIHIA |
| **Activitat** | Conjunt d'exercicis amb un objectiu comú | 1 sessió (45-60 min) | Inici → Desenvolupament → Tancament | 1-2 rols IA, un MIHIA predominant |
| **Tasca** | Repte complex que requereix diverses activitats | 2-5 sessions | Seqüència d'activitats connectades | Diversos rols IA, progressió MIHIA |
| **Projecte** | Conjunt de tasques amb producte final | 1-4 setmanes+ | Fases FJE (Repte→Investigació→Síntesi→Acció) | Rols i MIHIA diferents per fase/tasca |

### Relació jeràrquica

```
PROJECTE (setmanes)
├── Tasca 1 (sessions)
│   ├── Activitat 1.1 (1 sessió)
│   │   ├── Exercici A (minuts)
│   │   └── Exercici B
│   └── Activitat 1.2
│       ├── Exercici C
│       └── Exercici D
├── Tasca 2
│   ├── Activitat 2.1
│   └── Activitat 2.2
└── Tasca 3 (producte final)
```

### Implicacions per a l'app

| Paràmetre | Exercici | Activitat | Tasca | Projecte |
|---|---|---|---|---|
| **Input del docent** | Tema + objectiu concret | Tema + objectiu + sessió | Objectiu complex + sessions | Pregunta motriu + setmanes |
| **Output de l'app** | 1 fitxa amb instruccions | Seqüència didàctica 1 sessió | Pla de sessions amb activitats | Planificació completa amb tasques |
| **Rol IA** | Un sol rol fix | 1-2 rols | Diversos rols per activitat | Rols variables per fase |
| **MIHIA** | Un nivell fix | Un nivell predominant | Progressió entre nivells | Mapa complet de nivells |
| **Semàfor fricció** | 1 verificació | 1 per fase | 1 per activitat | 1 per tasca |
| **GRR (Fisher&Frey)** | No aplica (massa curt) | 1 fase predominant | Progressió entre fases | Cicle complet (Jo faig → Tu fas) |

### Durada i temporització

| Sessions | Què genera l'app | Consideracions |
|---|---|---|
| **< 1 sessió** | Exercici(s) individual(s) | Focus en un objectiu, un sol rol IA |
| **1 sessió** | Activitat completa | Inici + Desenvolupament + Tancament, amb temps per reflexió |
| **2-3 sessions** | Tasca amb 2-3 activitats | Progressió de MIHIA, varietat de rols IA |
| **4-6 sessions** | Tasca complexa o mini-projecte | Inclou investigació + creació + presentació |
| **1-2 setmanes** | Projecte curt | Fases FJE compartides, producte final |
| **3-4+ setmanes** | Projecte complet | Mapa IA per fase, múltiples productes intermedis |

> **Regla clau**: Un projecte pot tenir tasques amb IA i tasques SENSE IA (MIHIA 0). No tot ha de tenir IA — la no-delegació és una decisió pedagògica vàlida.

---

## 2. Model de Responsabilitat Gradual (Gradual Release of Responsibility)

**Autors**: Fisher & Frey

### Les 4 Fases

| Fase | Nom | Qui lidera | Descripció | Amb IA |
|---|---|---|---|---|
| 1 | **Jo faig** (I Do) | Docent | Modelatge explícit: el docent demostra el procés complet | El docent modela com usar la IA correctament |
| 2 | **Nosaltres fem** (We Do) | Docent + Alumnat | Pràctica guiada: el grup treballa conjuntament amb suport | Exercici col·lectiu amb IA, el docent guia |
| 3 | **Vosaltres feu** (You Do Together) | Alumnat en grup | Pràctica col·laborativa: petit grup sense intervenció directa | Grups usen IA amb pautes clares |
| 4 | **Tu fas** (You Do Alone) | Alumne individual | Pràctica independent: l'alumne demostra autonomia | L'alumne usa IA autònomament amb criteri |

### Regla d'or
> **Mai proposar ús autònom de la IA (Fase 4) sense modelatge previ (Fase 1).** L'alumne ha de veure com el docent usa la IA, després practicar-ho en grup, abans de fer-ho sol.

### Connexió amb MIHIA
| Fase GRR | Nivell MIHIA recomanat |
|---|---|
| Jo faig | Nivell 0-1 (el docent demostra) |
| Nosaltres fem | Nivell 1-2 (exploració/suport guiat) |
| Vosaltres feu | Nivell 2-3 (suport/cocreació en grup) |
| Tu fas | Nivell 3-4 (cocreació/delegació supervisada) |

---

## 3. Fases de Projecte (Marc FJE)

Estructura de projectes d'aprenentatge en 4 fases:

| Fase | Nom | Objectiu | Activitats típiques | Rol IA suggerit |
|---|---|---|---|---|
| 1 | **Repte / Comprensió** | Comprendre el problema, activar coneixements previs | Pregunta motriu, pluja d'idees, exploració | Simulador, Generador de Casos |
| 2 | **Investigació** | Cercar, analitzar, contrastar informació | Recerca, lectura, entrevistes, dades | Mentor Socràtic, Crític |
| 3 | **Síntesi / Creació** | Crear producte o solució | Redacció, disseny, producció | Crític/Editor, Traductor/Adaptador |
| 4 | **Acció / Comunicació** | Presentar, compartir, aplicar | Exposició, publicació, acció social | Traductor/Adaptador |

---

## 4. Scaffolding (Bastida Pedagògica)

### Principis de Scaffolding amb IA

| Principi | Descripció | Aplicació amb IA |
|---|---|---|
| **Temporal** | El suport es retira progressivament | Reduir el detall del prompt al llarg del curs |
| **Contingent** | S'ajusta al nivell de l'alumne | Adaptar la complexitat de la interacció |
| **Metacognitiu** | Fa visible el procés de pensament | La IA pregunta "per què ho fas així?" |
| **Procedimental** | Guia els passos a seguir | Prompt estructurat amb passos clars |

### Bastida per a Prompts de l'Alumnat
Estructura progressiva de prompts segons nivell de competència:

| Nivell | Bastida del prompt | Exemple |
|---|---|---|
| **Principiant** | Prompt complet donat pel docent, l'alumne només omple buits | "Explica'm [TEMA] com si tingués [EDAT] anys" |
| **Intermedi** | Estructura donada, l'alumne redacta el contingut | "Has de demanar a la IA: context + pregunta + format desitjat" |
| **Avançat** | L'alumne crea el seu propi prompt amb criteris de qualitat | "Dissenya un prompt que inclogui: rol, context, tasca, restriccions" |
| **Expert** | L'alumne avalua i optimitza prompts | "Crea 3 versions del prompt i justifica quina és millor" |

---

## 5. Factors Promotors de l'Aprenentatge

### Factors que les activitats amb IA han de preservar

| Factor | Descripció | Risc amb IA | Com preservar-lo |
|---|---|---|---|
| **Activació cognitiva** | L'alumne ha de pensar activament | La IA pensa per ell | CFF: pre-compromís, predicció |
| **Elaboració** | Connectar coneixement nou amb previ | La IA dona tot elaborat | L'alumne elabora primer, IA complementa |
| **Recuperació** | Recordar informació de memòria | La IA sempre la té disponible | Exercicis de recuperació SENSE IA primer |
| **Espaiat** | Distribuir la pràctica en el temps | La IA resol tot d'un cop | Activitats en fases amb intervals |
| **Interleaving** | Barrejar tipus de tasques | La IA fa tot un sol tipus | Alternar tasques amb i sense IA |
| **Feedback** | Informació sobre l'encert/error | La IA dona feedback genèric | IA com a feedback específic i accionable |
| **Metacognició** | Reflexionar sobre el propi aprenentatge | La IA no demana reflexió | Afegir sempre pas de reflexió post-IA |
| **Motivació intrínseca** | Interès genuí per la tasca | La IA fa la part interessant | L'alumne fa la part creativa, IA la tècnica |
| **Transferència** | Aplicar aprenentatge a nous contextos | L'alumne depèn de la IA | Tasques d'aplicació SENSE IA |

---

## 6. Tipus de Seqüències Didàctiques

### Estructures habituals

| Tipus | Estructura | Quan usar-la | Integració IA suggerida |
|---|---|---|---|
| **Lineal** | Inici → Desenvolupament → Tancament | Continguts conceptuals | IA en Desenvolupament (suport) |
| **Cíclica/Iterativa** | Prova → Feedback → Millora → Prova | Habilitats pràctiques | IA com a font de feedback iteratiu |
| **Investigativa** | Pregunta → Hipòtesi → Dades → Conclusió | Ciències, recerca | IA com a Generador de Casos/Dades |
| **Projecte** | Repte → Investigació → Creació → Acció | Interdisciplinari | IA en rols diferents per fase |
| **Flipped** | Contingut a casa → Aplicació a classe | Optimitzar temps presencial | IA per contingut previ, classe per fricció |
| **Socràtica** | Pregunta → Diàleg → Descobriment | Pensament crític, ètica | IA com a Mentor Socràtic |

---

## 7. Estructura de Proposta Completa

### Plantilla per al Generador (adaptable segons granularitat)

```
0. TIPUS I DURADA
   - Granularitat: Exercici / Activitat / Tasca / Projecte
   - Durada: Sessions / Setmanes
   - Nombre d'activitats (si Tasca o Projecte)

1. CONTEXT
   - Etapa educativa / Edat
   - Matèria / Àrea
   - Tema / Contingut curricular
   - Objectiu d'aprenentatge

2. PREPARACIÓ (Jo faig)
   - Què modela el docent
   - Com es presenta la tasca
   - Activació de coneixements previs

3. INTERACCIÓ AMB IA (Nosaltres fem → Tu fas)
   - Rol assignat a la IA
   - Prompt/instrucció que usarà l'alumne (amb bastida)
   - Nivell MIHIA de la interacció
   - Restriccions i pautes

4. POST-IA (Fricció productiva)
   - Què fa l'alumne amb el resultat de la IA
   - Moviment epistèmic esperat (Descoberta/Recursivitat/Resistència)
   - Funció de Forçat Cognitiu aplicada

5. EVIDÈNCIA D'APRENENTATGE
   - Com demostra l'alumne que ha après
   - Rúbrica o criteris d'avaluació
   - Reflexió metacognitiva
```
