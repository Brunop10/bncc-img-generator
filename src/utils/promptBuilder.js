const { getAgeAppropriateStyle } = require('./ageStyleMapper');

/**
 * Constrói o prompt educacional baseado nos dados da linha e faixa etária
 */
function buildEducationalPrompt(rowData) {
    const ageStyle = getAgeAppropriateStyle(rowData.ano);
    
    return `
IMAGE GENERATION RULES - MANDATORY:
1. ABSOLUTELY NO TEXT - Zero words, letters, numbers, labels, captions
2. PURE VISUAL ILLUSTRATION ONLY
3. IF ANY TEXT APPEARS = COMPLETE FAILURE

CREATE: Visual-only educational illustration
AGE: ${ageStyle.age_group}
STYLE: ${ageStyle.style}

CONCEPT TO ILLUSTRATE VISUALLY:
${rowData.descr_objetivo_ou_habilidade}
${rowData.habilidade_superior ? rowData.habilidade_superior : ''}
${rowData.explicacao ? rowData.explicacao : ''}
${rowData.exemplos ? rowData.exemplos : ''}

VISUAL APPROACH:
- Show concept through objects, actions, scenes
- Use symbols, colors, shapes to represent ideas, 
- If necessary to use persons: ${ageStyle.characters}
- Demonstrate through visual examples
- Make concept recognizable without reading with ${ageStyle.complexity}
- ${ageStyle.elements}

FORBIDDEN:
- Any readable text
- Labels or captions
- Written explanations
- Numbers or letters
- Speech bubbles with text
- Signs with words

REQUIRED:
- Pure illustration
- Clear visual concept
- Educational value through imagery only
- Teacher-friendly recognition
`;
}

module.exports = { buildEducationalPrompt };