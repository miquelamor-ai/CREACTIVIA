// CREACTIVITAT — Markdown Generator
// Converteix l'estructura JSON d'activitats i auditories a format Markdown llegible

/**
 * Genera Markdown per a una activitat generada
 * @param {object} result - Resultat amb mode:'generate', activity, audit
 * @returns {string} - Text en format Markdown
 */
export function generateActivityMarkdown(result) {
    const { activity, audit } = result;
    
    let md = `# ${activity.titol}\n\n`;
    
    // Resum
    md += `> ${activity.resum}\n\n`;
    
    // Metadata
    md += `## 📋 Informació general\n\n`;
    md += `| Camp | Valor |\n`;
    md += `|------|-------|\n`;
    md += `| **Etapa** | ${activity.metadata.etapa} |\n`;
    md += `| **Matèria** | ${activity.metadata.materia} |\n`;
    md += `| **Tema** | ${activity.metadata.tema} |\n`;
    md += `| **Nivell** | ${activity.metadata.nivell} |\n`;
    md += `| **Durada** | ${activity.metadata.durada} |\n\n`;
    
    // Objectiu
    md += `## 🎯 Objectiu d'aprenentatge\n\n`;
    md += `${activity.objectiu}\n\n`;
    
    // Preparació prèvia
    md += `## 🔧 Preparació\n\n`;
    md += `### Configuració de la IA\n\n`;
    md += `${activity.previ.ia_config}\n\n`;
    if (activity.previ.prompt_sistema) {
        md += `**Prompt del sistema:**\n\n`;
        md += `\`\`\`\n${activity.previ.prompt_sistema}\n\`\`\`\n\n`;
    }
    md += `### Preparació docent\n\n`;
    md += `${activity.previ.preparacio_docent}\n\n`;
    md += `### Preparació alumnat\n\n`;
    md += `${activity.previ.preparacio_alumne}\n\n`;
    
    // Model MIHIA i Rol IA
    md += `## 🤖 Integració de la IA\n\n`;
    md += `### Nivell MIHIA: ${activity.mihia.nivell} - ${activity.mihia.nom}\n\n`;
    md += `${activity.mihia.justificacio}\n\n`;
    md += `### Rol de la IA: ${activity.rolIA.principal}\n\n`;
    md += `${activity.rolIA.descripcio}\n\n`;
    
    // Seqüència didàctica
    md += `## 📚 Seqüència didàctica\n\n`;
    activity.sequencia.forEach((fase, index) => {
        md += `### Fase ${index + 1}: ${fase.fase} (${fase.durada})\n\n`;
        md += `**👨‍🏫 Docent:**\n${fase.docent}\n\n`;
        md += `**👨‍🎓 Alumnat:**\n${fase.alumne}\n\n`;
        if (fase.usaIA) {
            md += `**🤖 IA:**\n${fase.ia}\n\n`;
        }
        md += `*Referència pedagògica:* ${fase.referencia}\n\n`;
        md += `---\n\n`;
    });
    
    // Avaluació
    md += `## ✅ Avaluació\n\n`;
    md += `### Criteris\n\n`;
    md += `${activity.avaluacio.criteris}\n\n`;
    md += `### Estratègies\n\n`;
    md += `${activity.avaluacio.estrategies}\n\n`;
    
    // Competències 4D
    md += `## 🎓 Competències 4D\n\n`;
    Object.entries(activity.competencies4D).forEach(([key, value]) => {
        const icon = value.activa ? '✅' : '❌';
        const name = key.replace('D', 'D').replace('_', ': ');
        md += `${icon} **${name}** - ${value.detall}\n\n`;
    });
    
    // Semàfor de fricció (si hi ha auditoria)
    if (audit && audit.semafor) {
        md += `## 🚦 Auditoria pedagògica\n\n`;
        const emoji = audit.semafor.nivell === 'verd' ? '🟢' : audit.semafor.nivell === 'groc' ? '🟡' : '🔴';
        md += `### ${emoji} ${audit.semafor.resum}\n\n`;
        md += `${audit.semafor.justificacio}\n\n`;
    }
    
    // Inclusió
    md += `## ♿ Inclusió i DUA\n\n`;
    md += `${activity.inclusio.dua_aplicat}\n\n`;
    if (activity.inclusio.adaptacions) {
        md += `**Adaptacions:**\n${activity.inclusio.adaptacions}\n\n`;
    }
    
    // Recomanacions
    md += `## 💡 Recomanacions per al docent\n\n`;
    md += `${activity.recomanacions_docent}\n\n`;
    
    // Footer
    md += `---\n\n`;
    md += `*Generat amb [CREACTIVIA](https://github.com/miquelamor-ai/CREACTIVIA) - Jesuits Educació*\n`;
    
    return md;
}

/**
 * Genera Markdown per a una auditoria
 * @param {object} result - Resultat amb mode:'audit', activity (millorada), audit
 * @returns {string} - Text en format Markdown
 */
export function generateAuditMarkdown(result) {
    const { audit, activity } = result;
    
    let md = `# 🔍 Informe d'Auditoria Pedagògica\n\n`;
    
    // Semàfor
    const emojiSemafor = audit.semafor.nivell === 'verd' ? '🟢' : audit.semafor.nivell === 'groc' ? '🟡' : '🔴';
    md += `## ${emojiSemafor} Diagnòstic: ${audit.semafor.resum}\n\n`;
    md += `${audit.semafor.justificacio}\n\n`;
    
    // Punts forts
    if (audit.punts_forts && audit.punts_forts.length > 0) {
        md += `## ✨ Punts forts\n\n`;
        audit.punts_forts.forEach(punt => {
            md += `- ${punt}\n`;
        });
        md += `\n`;
    }
    
    // Riscos
    if (audit.riscos && audit.riscos.length > 0) {
        md += `## ⚠️ Riscos detectats\n\n`;
        audit.riscos.forEach(risc => {
            const iconSeveritat = risc.severitat === 'alta' ? '🔴' : risc.severitat === 'mitjana' ? '🟡' : '🟢';
            md += `### ${iconSeveritat} ${risc.tipus}\n\n`;
            md += `**Descripció:** ${risc.descripcio}\n\n`;
            md += `**On:** ${risc.on}\n\n`;
        });
    }
    
    // Millores
    if (audit.millores && audit.millores.length > 0) {
        md += `## 🚀 Propostes de millora\n\n`;
        audit.millores.forEach((millora, index) => {
            const iconPrioritat = millora.prioritat === 'alta' ? '🔴' : millora.prioritat === 'mitjana' ? '🟡' : '🟢';
            md += `### ${iconPrioritat} Millora ${index + 1}: ${millora.descripcio}\n\n`;
            md += `**Com implementar-la:** ${millora.com}\n\n`;
            md += `**Marc de referència:** ${millora.marc_referencia}\n\n`;
        });
    }
    
    // Veredicte
    md += `## 📊 Veredicte final\n\n`;
    md += `${audit.veredicte}\n\n`;
    
    // Activitat millorada (si existeix)
    if (activity) {
        md += `---\n\n`;
        md += `# ✨ Proposta millorada\n\n`;
        md += generateActivityMarkdown({ activity, audit: null });
    }
    
    // Footer
    md += `---\n\n`;
    md += `*Auditoria realitzada amb [CREACTIVIA](https://github.com/miquelamor-ai/CREACTIVIA) - Jesuits Educació*\n`;
    
    return md;
}

/**
 * Funció principal que detecta el tipus de resultat i genera el Markdown apropiat
 * @param {object} result - Resultat de generate o audit
 * @returns {string} - Text en format Markdown
 */
export function generateMarkdown(result) {
    if (!result || result.error) {
        return `# Error\n\nNo s'ha pogut generar el Markdown: ${result?.error || 'Resultat buit'}`;
    }
    
    if (result.mode === 'generate') {
        return generateActivityMarkdown(result);
    } else if (result.mode === 'audit') {
        return generateAuditMarkdown(result);
    } else {
        return `# Error\n\nMode desconegut: ${result.mode}`;
    }
}
