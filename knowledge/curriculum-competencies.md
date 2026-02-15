# Currículum Competencial

> Document de referència per als skills: Alineador Curricular, Generador d'Activitats

---

## 1. Marc Competencial General

### Competències Clau (Departament d'Educació de Catalunya)

| # | Competència | Descripció | Relació amb IA |
|---|---|---|---|
| C1 | **Comunicació lingüística** | Comprensió i expressió oral/escrita en diverses llengües | IA com a suport lingüístic, revisora, traductora |
| C2 | **Competència plurilingüe** | Ús funcional de diverses llengües | IA per practicar i comparar llengües |
| C3 | **STEM** | Matemàtiques, ciències, tecnologia, enginyeria | IA per generar problemes, analitzar dades |
| C4 | **Competència digital** | Ús crític i responsable de la tecnologia | Directament vinculada amb la fluïdesa en IA |
| C5 | **Competència personal, social i d'aprendre a aprendre** | Autoconeixement, regulació, metacognició | IA per a autoavaluació i reflexió |
| C6 | **Competència ciutadana** | Participació, ètica, drets, democràcia | Anàlisi crítica de biaixos i impacte social de la IA |
| C7 | **Competència emprenedora** | Creativitat, innovació, gestió de projectes | IA com a eina de prototipat i productivitat |
| C8 | **Competència en consciència i expressió culturals** | Expressió artística, patrimoni cultural | IA com a eina creativa (amb debat sobre autoria) |

---

## 2. Competència Digital de l'Alumnat (CDA)

### Marc CDA del Departament d'Educació

| Àrea | Descripció | Sub-competències | Activitats IA típiques |
|---|---|---|---|
| **CD1: Informació i alfabetització dades** | Cercar, filtrar, avaluar informació | Navegació, cerca, avaluació, emmagatzematge | Consultar IA, verificar respostes, contrastar fonts |
| **CD2: Comunicació i col·laboració** | Interactuar, compartir, col·laborar en entorns digitals | Interacció, compartició, col·laboració, netiqueta | Comunicar-se amb IA, compartir resultats |
| **CD3: Creació de contingut digital** | Crear, editar, integrar contingut nou | Desenvolupament, integració, programació, drets | Cocrear amb IA, generar contingut, prompts |
| **CD4: Seguretat** | Protecció de dispositius, dades, salut digital | Dispositius, dades personals, salut, medi ambient | Privacitat en l'ús d'IA, benestar digital |
| **CD5: Resolució de problemes** | Identificar necessitats, prendre decisions, innovar | Necessitats, decisions, innovació, pensament computacional | Enginyeria de prompts, avaluació d'eines IA |

### Connexió CDA amb Model 4D

| Àrea CDA | 4D principal | Nivell MIHIA on s'activa |
|---|---|---|
| CD1 (Informació) | D3 Discerniment | MIHIA 1 (Exploració) |
| CD2 (Comunicació) | D2 Descripció | MIHIA 2-3 |
| CD3 (Creació) | D2 Descripció | MIHIA 3-4 |
| CD4 (Seguretat) | D4 Diligència | MIHIA 0-5 (transversal) |
| CD5 (Resolució problemes) | D1 Delegació + D2 Descripció | MIHIA 2-4 |

---

## 3. Etapes Educatives i Nivells de Complexitat

### Adaptació per etapa

| Etapa | Edat | Nivells MIHIA recomanats | Complexitat prompt | Autonomia IA |
|---|---|---|---|---|
| **Primària CS** | 10-12 | 0-2 (predominant 0-1) | Prompts donats pel docent | Molt supervisada |
| **ESO 1r cicle** | 12-14 | 0-3 (predominant 1-2) | Prompts semi-guiats | Supervisada |
| **ESO 2n cicle** | 14-16 | 1-4 (predominant 2-3) | Prompts autònoms amb pauta | Guiada |
| **Batxillerat** | 16-18 | 1-5 (predominant 2-4) | Enginyeria de prompts | Semi-autònoma |
| **FP** | 16+ | 1-5 (segons mòdul) | Professional/tècnic | Contextual |

### Consideracions legals per edat
- **Menors de 14**: Consentiment parental per ús d'eines IA externes (LOPDGDD)
- **14-16**: Poden consentir però amb informació i supervisió
- **16+**: Autonomia amb formació prèvia

---

## 4. Àrees Curriculars i Integració IA

### Matriu d'IA per àrees

| Àrea | Rols IA més adequats | Exemples d'activitat | MIHIA típic |
|---|---|---|---|
| **Llengues** | Crític/Editor, Traductor, Mentor Socràtic | Revisió escriptura, pràctica oral, anàlisi textos | 2-3 |
| **Matemàtiques** | Generador de Casos, Mentor Socràtic, Teachable Agent | Problemes personalitzats, explicar conceptes a la IA | 1-3 |
| **Ciències Naturals** | Simulador, Generador de Casos | Experiments virtuals, anàlisi de dades | 2-4 |
| **Ciències Socials** | Simulador, Contrincant, Generador de Casos | Roleplay històric, debat de perspectives | 2-3 |
| **Tecnologia** | Mentor Socràtic, Crític | Programació amb feedback, disseny iteratiu | 3-4 |
| **Educació Artística** | Crític/Editor, Generador de Casos | Referents artístics, crítica d'obres, composició | 2-3 |
| **Educació Física** | Generador de Casos, Simulador | Plans d'entrenament, anàlisi tàctica | 1-2 |
| **Música** | Crític, Generador de Casos | Anàlisi musical, composició assistida | 2-3 |
| **Filosofia/Ètica** | Contrincant, Mentor Socràtic | Debat, anàlisi d'arguments, dilemes | 2-3 |
| **Orientació** | Mentor Socràtic, Simulador | Autoconeixement, simulació entrevistes | 1-2 |

---

## 5. Saberes Curriculars i Prompts

### Estructura per al Generador d'Activitats

Quan el docent indica matèria + tema, el sistema ha de connectar amb:
1. **Competència clau** activada (C1-C8)
2. **Àrea CDA** implicada (CD1-CD5)
3. **4D** que es treballen
4. **MIHIA** adequat per l'etapa
5. **Rol IA** més pertinent

### Exemple de connexió

```
Input: Llengua Catalana, 3r ESO, Text argumentatiu
→ C1 (Comunicació lingüística) + C4 (Digital)
→ CD3 (Creació contingut) + CD5 (Resolució problemes)
→ D2 (Descripció del prompt) + D3 (Discerniment del resultat)
→ MIHIA 2-3 (Suport/Cocreació)
→ Rol: Crític/Editor (revisa l'argumentació)
```
