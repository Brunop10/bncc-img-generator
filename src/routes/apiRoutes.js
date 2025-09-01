const express = require('express');
const imageController = require('../controllers/imageController');

const router = express.Router();

// Rota para gerar imagem
router.post('/generate-image', imageController.generateImage);

// Rota para carregar dados da planilha
router.get('/load-sheet-data', imageController.loadSheetData);

// Rota para aprovar imagem
router.post('/approve-image', imageController.approveImage);

module.exports = router;