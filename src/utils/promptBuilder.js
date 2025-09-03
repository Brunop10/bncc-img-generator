const { getAgeAppropriateStyle } = require('./ageStyleMapper');

function buildEducationalPrompt(rowData) {
    const ageStyle = getAgeAppropriateStyle(rowData.ano);
    
    return `
REGRAS DE GERAÇÃO DE IMAGEM - OBRIGATÓRIAS:
1. ABSOLUTAMENTE NENHUM TEXTO - Zero palavras, letras, números, rótulos, legendas
2. APENAS ILUSTRAÇÃO VISUAL PURA
3. SE QUALQUER TEXTO APARECER = FALHA COMPLETA
4. NÃO GERAR PESSOAS REAIS, APENAS FIGURAS OU DESENHOS

CRIAR: Ilustração educacional apenas visual
IDADE: ${ageStyle.age_group}
ESTILO: ${ageStyle.style}

CONCEITOS PARA AJUDAREM NA ILUSTRAÇÃO:
${rowData.descr_objetivo_ou_habilidade}
${rowData.habilidade_superior ? rowData.habilidade_superior : ''}
${rowData.explicacao ? rowData.explicacao : ''}
${rowData.exemplos ? rowData.exemplos : ''}

ABORDAGEM VISUAL:
- Mostrar conceito através de objetos, ações, cenas
- Usar símbolos, cores, formas para representar ideias
- Se necessário usar pessoas: ${ageStyle.characters}
- Demonstrar através de exemplos visuais
- Tornar conceito reconhecível sem leitura com ${ageStyle.complexity}
- ${ageStyle.elements}

PROIBIDO:
- Qualquer texto legível
- Rótulos ou legendas
- Explicações escritas
- Números ou letras
- Balões de fala com texto
- Placas com palavras

OBRIGATÓRIO:
- Ilustração pura
- Conceito visual claro
- Valor educacional apenas através de imagens
- Reconhecimento amigável ao professor
`;
}

function buildCombinedPrompt(rowData, customPrompt) {
    const basePrompt = buildEducationalPrompt(rowData);
    
    return `${basePrompt}

🎯 FOCO ESPECIAL E PRIORIDADE:
${customPrompt}

IMPORTANTE: Mantenha todas as regras e configurações acima, mas dê prioridade especial ao foco descrito. Combine harmoniosamente o conceito educacional base com a ideia personalizada, garantindo que ambos sejam representados visualmente na ilustração final.`;
}

module.exports = { buildEducationalPrompt, buildCombinedPrompt };