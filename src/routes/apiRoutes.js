const express = require('express');
const imageController = require('../controllers/imageController');

const router = express.Router();

router.post('/generate-image', imageController.generateImage);

router.get('/load-sheet-data', imageController.loadSheetData);

router.post('/approve-image', imageController.approveImage);

module.exports = router;