const express = require('express');
const cors = require('cors');
const path = require('path');
const config = require('./src/config/environment');
const apiRoutes = require('./src/routes/apiRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.static(path.join(__dirname, 'public')));

// Rotas da API
app.use('/api', apiRoutes);

// Rota principal
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Iniciar servidor
app.listen(config.PORT, () => {
    console.log(`Servidor rodando na porta ${config.PORT}`);
    console.log(`Acesse: http://localhost:${config.PORT}`);
});
