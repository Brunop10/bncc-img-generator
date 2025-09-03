const { google } = require('googleapis');
const config = require('../config/environment');

async function getGoogleSheetsClient() {
    const auth = new google.auth.GoogleAuth({
        credentials: {
            type: 'service_account',
            project_id: process.env.GOOGLE_PROJECT_ID,
            private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
            client_email: process.env.GOOGLE_CLIENT_EMAIL,
        },
        scopes: ['https://www.googleapis.com/auth/spreadsheets']
    });
    return google.sheets({ version: 'v4', auth });
}

async function loadSheetData() {
    try {
        const sheets = await getGoogleSheetsClient();
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: config.GOOGLE_SHEETS.SHEET_ID,
            range: config.GOOGLE_SHEETS.RANGE
        });
        
        const rows = response.data.values;
        if (!rows || rows.length === 0) {
            return { success: false, message: 'Nenhum dado encontrado na planilha' };
        }
        
        const headers = rows[0];
        const data = [];
        
        const getColumnIndex = (columnName) => {
            const index = headers.findIndex(header => 
                header.toLowerCase().trim() === columnName.toLowerCase().trim()
            );
            return index !== -1 ? index : null;
        };
        
        const columnIndices = {
            ano: getColumnIndex('ano'),
            descr_objetivo_ou_habilidade: getColumnIndex('descr_objetivo_ou_habilidade'),
            habilidade_superior: getColumnIndex('habilidade_superior'),
            explicacao: getColumnIndex('explicacao'),
            exemplos: getColumnIndex('exemplos'),
            img_url_1: getColumnIndex('img_url_1'),
        };
        
        for (let i = 1; i < rows.length; i++) {
            const row = rows[i];
            const rowData = {
                rowIndex: i + 1,
                ano: columnIndices.ano !== null ? (row[columnIndices.ano] || '') : '',
                descr_objetivo_ou_habilidade: columnIndices.descr_objetivo_ou_habilidade !== null ? (row[columnIndices.descr_objetivo_ou_habilidade] || '') : '',
                habilidade_superior: columnIndices.habilidade_superior !== null ? (row[columnIndices.habilidade_superior] || '') : '',
                explicacao: columnIndices.explicacao !== null ? (row[columnIndices.explicacao] || '') : '',
                exemplos: columnIndices.exemplos !== null ? (row[columnIndices.exemplos] || '') : '',
                img_url_1: columnIndices.img_url_1 !== null ? (row[columnIndices.img_url_1] || '') : ''
            };
            data.push(rowData);
        }
        
        return { success: true, data };
    } catch (error) {
        console.error('Erro ao carregar dados da planilha:', error);
        return { success: false, error: error.message };
    }
}

async function getFirstRowWithoutImage() {
    try {
        const result = await loadSheetData();
        if (!result.success) {
            return result;
        }
        
        const firstRowWithoutImage = result.data.find(row => 
            !row.img_url_1
        );
        
        if (firstRowWithoutImage) {
            return { success: true, data: firstRowWithoutImage };
        } else {
            return { success: false, message: 'Todas as linhas já possuem imagens' };
        }
    } catch (error) {
        console.error('Erro ao buscar linha sem imagem:', error);
        return { success: false, error: error.message };
    }
}

async function getColumnIndexByName(columnName) {
    try {
        const sheets = await getGoogleSheetsClient();
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: config.GOOGLE_SHEETS.SHEET_ID,
            range: `${config.GOOGLE_SHEETS.RANGE.split('!')[0]}!1:1` 
        });
        
        const headers = response.data.values[0];
        const index = headers.findIndex(header => 
            header.toLowerCase().trim() === columnName.toLowerCase().trim()
        );
        
        return index !== -1 ? index + 1 : null; 
    } catch (error) {
        console.error('Erro ao obter índice da coluna:', error);
        return null;
    }
}

async function updateSheetUrl(rowIndex, columnName, url) {
    try {
        const columnIndex = await getColumnIndexByName(columnName);
        if (!columnIndex) {
            throw new Error(`Coluna '${columnName}' não encontrada`);
        }
        
        const sheets = await getGoogleSheetsClient();
        const columnLetter = String.fromCharCode(64 + columnIndex); 
        const range = `${config.GOOGLE_SHEETS.RANGE.split('!')[0]}!${columnLetter}${rowIndex}`;
        
        await sheets.spreadsheets.values.update({
            spreadsheetId: config.GOOGLE_SHEETS.SHEET_ID,
            range: range,
            valueInputOption: 'RAW',
            resource: {
                values: [[url]]
            }
        });
        
        return { success: true };
    } catch (error) {
        console.error('Erro ao atualizar planilha:', error);
        return { success: false, error: error.message };
    }
}

async function updateGoogleSheets(sheetId, rowIndex, imageNumber, imageUrl) {
    try {
        const columnMap = {
            1: 'img_url_1'
        };
        
        const columnName = columnMap[imageNumber];
        if (!columnName) {
            throw new Error(`Número de imagem inválido: ${imageNumber}`);
        }
        
        return await updateSheetUrl(rowIndex, columnName, imageUrl);
    } catch (error) {
        console.error('Erro ao atualizar Google Sheets:', error);
        return { success: false, error: error.message };
    }
}

module.exports = {
    getGoogleSheetsClient,
    loadSheetData,
    getFirstRowWithoutImage,
    updateSheetUrl,
    updateGoogleSheets,
    getColumnIndexByName
};