const geminiService = require('../services/geminiService');
const googleSheetsService = require('../services/googleSheetsService');
const cloudinaryService = require('../services/cloudinaryService');

/**
 * Gera imagem usando API Gemini
 */
async function generateImage(req, res) {
    try {
        const { rowData, imageNumber, customPrompt } = req.body;
        
        if (!rowData) {
            return res.status(400).json({ 
                success: false, 
                error: 'Dados da linha são obrigatórios' 
            });
        }

        console.log(`Gerando imagem ${imageNumber} para linha:`, rowData);
        if (customPrompt) {
            console.log('Usando prompt personalizado:', customPrompt);
        }
        
        const result = await geminiService.generateImageWithGemini(rowData, customPrompt);
        
        res.json({
            success: true,
            imageUrl: result.imageUrl,
            message: customPrompt ? 'Imagem gerada com prompt personalizado' : 'Imagem gerada com sucesso'
        });
    } catch (error) {
        console.error('Erro ao gerar imagem:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
}

/**
 * Carrega dados da planilha
 */
async function loadSheetData(req, res) {
    try {
        // Carregar todos os dados da planilha
        const allDataResult = await googleSheetsService.loadSheetData();
        if (!allDataResult.success) {
            return res.json(allDataResult);
        }

        // Encontrar a primeira linha sem imagem
        const firstRowWithoutImageResult = await googleSheetsService.getFirstRowWithoutImage();
        
        // Determinar o índice da primeira linha sem imagem
        let currentIndex = 0;
        if (firstRowWithoutImageResult.success && firstRowWithoutImageResult.data) {
            currentIndex = allDataResult.data.findIndex(row => 
                row.rowIndex === firstRowWithoutImageResult.data.rowIndex
            );
            if (currentIndex === -1) currentIndex = 0;
        }

        res.json({
            success: true,
            allData: allDataResult.data,
            currentIndex: currentIndex,
            data: allDataResult.data[currentIndex] || null,
            totalRows: allDataResult.data.length
        });
    } catch (error) {
        console.error('Erro ao carregar dados:', error);
        res.status(500).json({
            success: false,
            error: 'Erro ao carregar dados da planilha'
        });
    }
}

/**
 * Aprova imagem e salva no Cloudinary
 */
async function approveImage(req, res) {
    try {
        const { imageUrl, rowIndex, imageNumber } = req.body;
        
        if (!imageUrl || !rowIndex || !imageNumber) {
            return res.status(400).json({
                success: false,
                error: 'URL da imagem, índice da linha e número da imagem são obrigatórios'
            });
        }
        
        // Salva no Cloudinary
        const cloudinaryResult = await cloudinaryService.saveImageByUrl(imageUrl);
        
        if (!cloudinaryResult.success) {
            return res.status(500).json({
                success: false,
                error: 'Erro ao salvar imagem no Cloudinary'
            });
        }
        
        // Atualiza planilha
        const sheetsResult = await googleSheetsService.updateGoogleSheets(
            process.env.GOOGLE_SHEET_ID,
            rowIndex,
            imageNumber,
            cloudinaryResult.url
        );
        
        if (sheetsResult.success) {
            res.json({
                success: true,
                message: 'Imagem aprovada e salva com sucesso',
                cloudinaryUrl: cloudinaryResult.url
            });
        } else {
            res.status(500).json({
                success: false,
                error: 'Erro ao atualizar planilha'
            });
        }
    } catch (error) {
        console.error('Erro ao aprovar imagem:', error);
        res.status(500).json({
            success: false,
            error: 'Erro interno do servidor'
        });
    }
}

module.exports = {
    generateImage,
    loadSheetData,
    approveImage
};