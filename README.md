# CREACTIVITAT — Generador i Auditor d'Activitats amb IA

Aplicació web per a dissenyar i auditar activitats d'aula que integren la Intel·ligència Artificial, assegurant l'alineació amb marcs pedagògics rigorosos (Model 4D, MIHIA, Fricció Cognitiva, PPI, DUA).

## 🚀 Com començar

### 1. Instal·lació
Necessites tenir [Node.js](https://nodejs.org/) instal·lat.

```bash
# Instal·la les dependències
npm install
```

### 2. Execució
Per obrir l'entorn de desenvolupament local:

```bash
npm run dev
```

Obre el navegador a: `http://localhost:5173/`

### 3. Configuració
L'aplicació requereix una **API Key de Google Gemini**.
- Obtén-la a: [Google AI Studio](https://aistudio.google.com/)
- Introdueix-la al banner superior de l'aplicació (es guarda en el teu navegador localment).

## 📂 Estructura del Projecte

- `knowledge/`: Base de coneixement pedagògic (fitxers Markdown).
- `src/skills/`: Lògica dels "agents" (Generador, Auditor, Orquestrador).
- `src/ui/`: Components de la interfície (Wizard, Resultats).
- `src/api/`: Client per a connectar amb Gemini.
- `style.css`: Sistema de disseny "dark mode" institucional.

## 🛠️ Tecnologies

- **Frontend**: Vanilla JS + Vite (lleuger i ràpid).
- **Estils**: CSS modern amb variables (sense frameworks externs).
- **IA**: Google Gemini API (`gemini-1.5-flash`).
- **Pedagogia**: Integració directa de marcs teòrics al prompt.

## ❓ Resolució de Problemes

### Error 429 (Quota Exceeded)
Si reps un error "Quota exceeded":
1. L'aplicació està configurada per usar `gemini-1.5-flash` (més generós amb la capa gratuïta).
2. Hem implementat un sistema de reintent automàtic. Espera uns segons i torna-ho a provar.
3. Si persisteix, és possible que hagis esgotat el límit diari del teu compte gratuït de Google.

   - Generació automàtica de seqüències didàctiques.
   - Assignació de rols IA, nivells MIHIA i competències.

2. **Mode Audita (🔍)**:
   - Anàlisi automàtica d'activitats existents.
   - Semàfor de Fricció Cognitiva (🔴🟡🟢).
   - Detecció de riscos (Skill Decay, Rendició Cognitiva).
   - Propostes de millora pedagògica.
