// CREACTIVITAT — Knowledge Loader
// Loads and selects relevant .md knowledge files for prompt context

const KNOWLEDGE_FILES = {
    friccio: 'friccio-cognitiva.md',
    disseny: 'disseny-instruccional.md',
    rols: 'rols-interaccio-ia.md',
    mihia: 'model-4d-mihia.md',
    etic: 'marc-etic-institucional.md',
    marc: 'marc-general-ia.md',
    ignasi: 'pedagogia-ignasiana.md',
    inclusio: 'inclusio-necessitats.md',
    curriculum: 'curriculum-competencies.md',
    competencia: 'competencia-digital-ia.md'
};

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
 * Load specific knowledge files by ID.
 * Optimized for "High Precision" loading in the Quality Chain.
 * @param {string[]} fileIds - Array of file IDs to load (e.g. ['disseny', 'mihia'])
 */
export async function loadSpecificKnowledge(fileIds) {
    const promises = fileIds.map(id => {
        const filename = KNOWLEDGE_FILES[id];
        if (!filename) return Promise.resolve('');
        return loadFile(filename).then(content => `--- KNOWLEDGE: ${filename} ---\n${content}\n`);
    });

    const contents = await Promise.all(promises);
    return contents.filter(Boolean).join('\n');
}
