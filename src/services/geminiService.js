const config = require('../config/environment');
const { buildEducationalPrompt, buildCombinedPrompt } = require('../utils/promptBuilder');
const cloudinaryService = require('./cloudinaryService');

async function generateImageWithGemini(rowData, customPrompt = null) {
    try {
        if (!config.GEMINI.API_KEY) {
            throw new Error('GEMINI_API_KEY não encontrada nas variáveis de ambiente');
        }

        const prompt = customPrompt ? 
            buildCombinedPrompt(rowData, customPrompt) : 
            buildEducationalPrompt(rowData);
        
        console.log(`Gerando imagem com prompt: ${customPrompt ? 'combinado (base + personalizado)' : 'automático'}`);
        console.log(`Adaptando para faixa etária baseada no ano: ${rowData.ano}`);

        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-preview-image-generation:generateContent?key=${config.GEMINI.API_KEY}`;
        const headers = { "Content-Type": "application/json" };
        const payload = {
            "contents": [{
                "parts": [{
                    "text": prompt
                }]
            }],
            "generationConfig": {
                "response_modalities": ["TEXT", "IMAGE"],
                "temperature": 0.7,
                "topK": 40,
                "topP": 0.95,
                "maxOutputTokens": 2048
            }
        };

        console.log('Gerando imagem com Gemini...');
        const response = await fetch(url, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errorText = await response.text();
            
            if (response.status === 429 || errorText.includes('quota') || errorText.includes('QUOTA') || 
                errorText.includes('Resource has been exhausted') || errorText.includes('daily limit')) {
                throw new Error('USO DIÁRIO DA GERAÇÃO DE IA EXPIRADO TENTE NOVAMENTE AMANHÃ');
            }
            
            throw new Error(`Erro na API Gemini: ${response.status} - ${errorText}`);
        }

        const result = await response.json();
        
        if (result.candidates && result.candidates.length > 0) {
            const candidate = result.candidates[0];
            if (candidate.content && candidate.content.parts) {
                for (const part of candidate.content.parts) {
                    if (part.inlineData && part.inlineData.data) {
                        console.log('Fazendo upload para Cloudinary...');
                        const cloudinaryResult = await cloudinaryService.uploadBase64Image(part.inlineData.data);

                        console.log('✅ Imagem gerada e enviada com sucesso!');
                        return {
                            success: true,
                            imageUrl: cloudinaryResult.secure_url,
                            prompt: prompt
                        };
                    }
                }
            }
        }

        throw new Error('Nenhuma imagem foi gerada pela API');
        
    } catch (error) {
        console.error('Erro ao gerar imagem:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

module.exports = { generateImageWithGemini };