// CREACTIVITAT — Knowledge Loader
// Loads and selects relevant .md knowledge files for prompt context

const KNOWLEDGE_FILES = [
    { id: 'friccio', file: 'friccio-cognitiva.md', tags: ['audit'] },
    { id: 'disseny', file: 'disseny-instruccional.md', tags: ['generate'] },
    { id: 'rols', file: 'rols-interaccio-ia.md', tags: ['generate'] },
    { id: 'mihia', file: 'model-4d-mihia.md', tags: ['generate', 'audit'] },
    { id: 'etic', file: 'marc-etic-institucional.md', tags: ['audit'] },
    { id: 'marc', file: 'marc-general-ia.md', tags: ['context'] }, // Optional
    { id: 'ignasi', file: 'pedagogia-ignasiana.md', tags: ['context'] }, // Optional
    { id: 'inclusio', file: 'inclusio-necessitats.md', tags: ['context'] },
    { id: 'curriculum', file: 'curriculum-competencies.md', tags: ['context'] },
    { id: 'competencia', file: 'competencia-digital-ia.md', tags: ['context'] },
];

// Cache for loaded files
const cache = {};

async function loadFile(filename) {
    if (cache[filename]) return cache[filename];
    try {
        const resp = await fetch(`/knowledge/${filename}`);
        if (!resp.ok) throw new Error(`No s'ha pogut carregar ${filename}`);
        const text = await resp.text();
        cache[filename] = text;
        return text;
    } catch (e) {
        console.warn(`Knowledge file not found: ${filename}`, e);
        return '';
    }
}

/**
 * Get relevant knowledge context for a given mode.
 * OPTIMIZED: Loads strictly the minimum necessary files to save tokens.
 */
export async function getKnowledgeContext(mode, options = {}) {
    let filesToLoad = [];

    if (mode === 'generate') {
        // Core files for generation (minimal set)
        filesToLoad = [
            'disseny-instruccional.md', // Essential for structure
            'model-4d-mihia.md',        // Essential for AI levels
            'rols-interaccio-ia.md'     // Essential for roles
        ];

        // Add optional context if requested or if we want more detail (but risky for quota)
        // filesToLoad.push('marc-general-ia.md'); 
    } else if (mode === 'audit') {
        // Core files for auditing
        filesToLoad = [
            'friccio-cognitiva.md',     // Essential for friction
            'model-4d-mihia.md',        // Essential for analysis
            'marc-etic-institucional.md' // Essential for ethics
        ];
    }

    const promises = filesToLoad.map(f => loadFile(f));
    const contents = await Promise.all(promises);

    return filesToLoad.map((f, i) => {
        if (!contents[i]) return '';
        return `--- KNOWLEDGE: ${f} ---\n${contents[i]}\n`;
    }).filter(Boolean).join('\n');
}

/**
 * Fallback for summarized context if needed.
 */
export async function getCompactContext(mode) {
    return getKnowledgeContext(mode); // Now the default is already compact
}
