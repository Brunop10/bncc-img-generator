/**
 * Retorna características visuais apropriadas para a faixa etária baseada no campo 'ano'.
 */
function getAgeAppropriateStyle(ano) {
    try {
        const anoNum = ano ? parseInt(ano.toString().replace('-', '')) : 1;
        
        if (anoNum === 0) { // Educação Infantil (3-5 anos)
            return {
                age_group: 'early childhood education (3-5 years)',
                style: 'Educational scene showing teacher with young children in classroom setting',
                complexity: 'Simple activities like circle time, basic motor skills, sensory play',
                characters: 'Teacher guiding small children in age-appropriate learning activities',
                elements: 'Classroom materials for early childhood: blocks, simple puzzles, movement activities, basic counting with objects'
            };
        } else if (anoNum === 15) { // 1º-5º ano (6-10 anos)
            return {
                age_group: 'elementary school (6-10 years)',
                style: 'Teacher guiding students through foundational learning activities',
                complexity: 'Progressive learning from basic to intermediate concepts, hands-on activities',
                characters: 'Teacher with elementary students aged 6-10 engaged in diverse learning experiences',
                elements: 'Mixed classroom environment with manipulatives, visual aids, interactive technology, group work spaces, and age-appropriate learning materials'
            };
        } else if (anoNum >= 1 && anoNum <= 2) { // 1º-2º ano (6-7 anos)
            return {
                age_group: 'early elementary (6-7 years)',
                style: 'Teacher demonstrating foundational concepts to young students',
                complexity: 'Basic literacy and numeracy activities, simple true/false exercises',
                characters: 'Teacher with 6-7 year old students engaged in learning activities',
                elements: 'Classroom scenes with alphabet cards, number lines, students raising green/red cards for true/false, basic reading activities'
            };
        } else if (anoNum >= 3 && anoNum <= 5) { // 3º-5º ano (8-10 anos)
            return {
                age_group: 'middle elementary (8-10 years)',
                style: 'Teacher facilitating more complex learning activities with elementary students',
                complexity: 'Problem-solving activities, group work, basic research and presentation skills',
                characters: 'Teacher and 8-10 year old students working on collaborative projects',
                elements: 'Classroom with computers, students presenting projects, group discussions, hands-on experiments, mathematical problem solving'
            };
        } else if (anoNum === 69) { // 6º-9º ano (11-14 anos)
            return {
                age_group: 'middle school (11-14 years)',
                style: 'Teacher engaging adolescent students in advanced learning activities',
                complexity: 'Abstract thinking, critical analysis, independent research, complex problem-solving',
                characters: 'Teacher with teenage students (11-14 years) in sophisticated learning environments',
                elements: 'Advanced classroom technology, students debating, scientific experiments, coding activities, collaborative research projects'
            };
        } else { // Outros anos ou padrão
            return {
                age_group: 'general elementary education',
                style: 'Teacher demonstrating educational concepts in classroom setting',
                complexity: 'Adaptable teaching activities suitable for various elementary grades',
                characters: 'Teacher and elementary students engaged in learning process',
                elements: 'Versatile classroom materials, interactive learning activities, student participation and engagement'
            };
        }
    } catch (error) {
        // Fallback para erro
        return {
            age_group: 'general elementary education',
            style: 'Teacher demonstrating educational concepts in classroom setting',
            complexity: 'Adaptable teaching activities suitable for various elementary grades',
            characters: 'Teacher and elementary students engaged in learning process',
            elements: 'Versatile classroom materials, interactive learning activities, student participation and engagement'
        };
    }
}

module.exports = { getAgeAppropriateStyle };