function getAgeAppropriateStyle(ano) {
    try {
        const anoNum = ano ? parseInt(ano.toString().replace('-', '')) : 1;
        
        if (anoNum === 0) { 
            return {
                age_group: 'educação infantil (3-5 anos)',
                style: 'Cena educacional mostrando professor com crianças pequenas em ambiente de sala de aula',
                complexity: 'Atividades simples como roda de conversa, habilidades motoras básicas, brincadeiras sensoriais',
                characters: 'Professor orientando crianças pequenas em atividades de aprendizagem adequadas à idade',
                elements: 'Materiais de sala de aula para educação infantil: blocos, quebra-cabeças simples, atividades de movimento, contagem básica com objetos'
            };
        } else if (anoNum === 15) {
            return {
                age_group: 'ensino fundamental I (6-10 anos)',
                style: 'Professor orientando estudantes através de atividades de aprendizagem fundamentais',
                complexity: 'Aprendizagem progressiva de conceitos básicos a intermediários, atividades práticas',
                characters: 'Professor com estudantes do ensino fundamental de 6-10 anos engajados em experiências diversas de aprendizagem',
                elements: 'Ambiente de sala de aula misto com materiais manipuláveis, recursos visuais, tecnologia interativa, espaços para trabalho em grupo e materiais de aprendizagem adequados à idade'
            };
        } else if (anoNum >= 1 && anoNum <= 2) { 
            return {
                age_group: 'anos iniciais do fundamental (6-7 anos)',
                style: 'Professor demonstrando conceitos fundamentais para estudantes jovens',
                complexity: 'Atividades básicas de alfabetização e numeramento, exercícios simples de verdadeiro/falso',
                characters: 'Professor com estudantes de 6-7 anos engajados em atividades de aprendizagem',
                elements: 'Cenas de sala de aula com cartões do alfabeto, linha numérica, estudantes levantando cartões verdes/vermelhos para verdadeiro/falso, atividades básicas de leitura'
            };
        } else if (anoNum >= 3 && anoNum <= 5) { 
            return {
                age_group: 'anos intermediários do fundamental (8-10 anos)',
                style: 'Professor facilitando atividades de aprendizagem mais complexas com estudantes do ensino fundamental',
                complexity: 'Atividades de resolução de problemas, trabalho em grupo, habilidades básicas de pesquisa e apresentação',
                characters: 'Professor e estudantes de 8-10 anos trabalhando em projetos colaborativos',
                elements: 'Sala de aula com computadores, estudantes apresentando projetos, discussões em grupo, experimentos práticos, resolução de problemas matemáticos'
            };
        } else if (anoNum === 69) { 
            return {
                age_group: 'ensino fundamental II (11-14 anos)',
                style: 'Professor engajando estudantes adolescentes em atividades avançadas de aprendizagem',
                complexity: 'Pensamento abstrato, análise crítica, pesquisa independente, resolução de problemas complexos',
                characters: 'Professor com estudantes adolescentes (11-14 anos) em ambientes sofisticados de aprendizagem',
                elements: 'Tecnologia avançada de sala de aula, estudantes debatendo, experimentos científicos, atividades de programação, projetos de pesquisa colaborativa'
            };
        } else { 
            return {
                age_group: 'educação fundamental geral',
                style: 'Professor demonstrando conceitos educacionais em ambiente de sala de aula',
                complexity: 'Atividades de ensino adaptáveis adequadas para várias séries do ensino fundamental',
                characters: 'Professor e estudantes do ensino fundamental engajados no processo de aprendizagem',
                elements: 'Materiais versáteis de sala de aula, atividades interativas de aprendizagem, participação e engajamento dos estudantes'
            };
        }
    } catch (error) {
        return {
            age_group: 'educação fundamental geral',
            style: 'Professor demonstrando conceitos educacionais em ambiente de sala de aula',
            complexity: 'Atividades de ensino adaptáveis adequadas para várias séries do ensino fundamental',
            characters: 'Professor e estudantes do ensino fundamental engajados no processo de aprendizagem',
            elements: 'Materiais versáteis de sala de aula, atividades interativas de aprendizagem, participação e engajamento dos estudantes'
        };
    }
}

module.exports = { getAgeAppropriateStyle };