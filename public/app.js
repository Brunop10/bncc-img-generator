// Configurações globais
const CONFIG = {
    GOOGLE_SHEETS_API_KEY: 'SUA_API_KEY_AQUI',
    GEMINI_API_KEY: 'SUA_GEMINI_API_KEY_AQUI',
    CLOUDINARY_CLOUD_NAME: 'SEU_CLOUD_NAME_AQUI',
    CLOUDINARY_UPLOAD_PRESET: 'SEU_UPLOAD_PRESET_AQUI'
};

// Variáveis globais
let sheetData = [];
let currentRowIndex = -1;
let totalRows = 0;

// Estado da aplicação
let appState = {
    currentRowData: null,
    totalPending: 0,
    generatedImage: null,
    quotaExceeded: false
};

// Função para mostrar status
function showStatus(message, type = 'info') {
    const statusDiv = document.getElementById('status');
    statusDiv.innerHTML = `<div class="status ${type}">${message}</div>`;
    
    if (type === 'success' || type === 'error') {
        setTimeout(() => {
            statusDiv.innerHTML = '';
        }, 5000);
    }
}

// Função para limpar prompt personalizado
function clearCustomPrompt() {
    const customPromptField = document.getElementById('customPrompt1');
    if (customPromptField) {
        customPromptField.value = '';
        showStatus('✅ Prompt personalizado limpo!', 'success');
    }
}

// Função para carregar dados da planilha
async function loadSheetData() {
    showStatus('📊 Carregando dados da planilha "Habilidades"...', 'info');
    
    try {
        const response = await fetch('/api/load-sheet-data');
        
        if (!response.ok) {
            throw new Error(`Erro HTTP: ${response.status}`);
        }
        
        const result = await response.json();
        
        if (!result.success) {
            throw new Error(result.error);
        }
        
        if (!result.allData || result.allData.length === 0) {
            showStatus('✅ Nenhum dado encontrado na planilha!', 'info');
            return;
        }
        
        // Armazenar todos os dados e configurar navegação
        sheetData = result.allData;
        totalRows = result.totalRows || result.allData.length;
        currentRowIndex = result.currentIndex || 0;
        
        // Atualizar interface com os dados carregados
        updateInterface(sheetData[currentRowIndex]);
        updateNavigation();
        showStatus(`✅ Dados carregados! Linha ${currentRowIndex + 1} de ${totalRows} (primeira sem imagem)`, 'success');
        
    } catch (error) {
        console.error('Erro ao carregar dados:', error);
        showStatus(`❌ Erro ao carregar dados: ${error.message}`, 'error');
    }
}

// Função para atualizar interface
function updateInterface(rowData) {
    if (!rowData) return;
    
    // Atualizar informações da linha
    document.getElementById('description').textContent = rowData.descr_objetivo_ou_habilidade || 'N/A';
    document.getElementById('skill').textContent = rowData.habilidade_superior || 'N/A';
    document.getElementById('explanation').textContent = rowData.explicacao || 'N/A';
    document.getElementById('examples').textContent = rowData.exemplos || 'N/A';
    document.getElementById('year').textContent = rowData.ano || 'N/A';
    
    // Gerenciar exibição da imagem existente
    const existingImageSection = document.getElementById('existingImageSection');
    const existingImage = document.getElementById('existingImage');
    const existingImageLink = document.getElementById('existingImageLink');
    const existingUrlWarning = document.getElementById('existingUrlWarning');
    
    if (rowData.img_url_1) {
        // Mostrar imagem existente
        if (existingImageSection) {
            existingImageSection.style.display = 'block';
        }
        
        if (existingImage) {
            existingImage.src = rowData.img_url_1;
            existingImage.onerror = function() {
                // Se a imagem não carregar, mostrar placeholder
                this.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlbSBuw6NvIGVuY29udHJhZGE8L3RleHQ+PC9zdmc+';
                this.style.opacity = '0.5';
            };
        }
        
        if (existingImageLink) {
            existingImageLink.href = rowData.img_url_1;
        }
        
        // Mostrar aviso
        if (existingUrlWarning) {
            existingUrlWarning.style.display = 'block';
        }
        
        // Atualizar texto do botão
        const generateBtn = document.getElementById('generateBtn1');
        if (generateBtn) {
            generateBtn.textContent = '🎨 Gerar Nova Imagem';
        }
        
    } else {
        // Ocultar imagem existente
        if (existingImageSection) {
            existingImageSection.style.display = 'none';
        }
        
        if (existingUrlWarning) {
            existingUrlWarning.style.display = 'none';
        }
        
        // Restaurar texto do botão
        const generateBtn = document.getElementById('generateBtn1');
        if (generateBtn) {
            generateBtn.textContent = '🎨 Gerar Imagem';
        }
    }
    
    // Resetar estado das imagens
    resetImages();
    
    // Mostrar interface
    document.getElementById('navigation').style.display = 'flex';
    document.getElementById('imageSection').style.display = 'grid';
    document.getElementById('rowInfo').style.display = 'block';
}

// Função para atualizar navegação (corrigida para usar os IDs corretos do HTML)
function updateNavigation() {
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const currentRowSpan = document.getElementById('currentRow');
    const totalRowsSpan = document.getElementById('totalRows');
    const progressFill = document.getElementById('progressFill');
    
    if (prevBtn) prevBtn.disabled = (currentRowIndex <= 0);
    if (nextBtn) nextBtn.disabled = (currentRowIndex >= totalRows - 1);
    
    if (currentRowSpan) {
        currentRowSpan.textContent = currentRowIndex + 1;
    }
    
    if (totalRowsSpan) {
        totalRowsSpan.textContent = totalRows;
    }
    
    if (progressFill) {
        const progress = totalRows > 0 ? ((currentRowIndex + 1) / totalRows) * 100 : 0;
        progressFill.style.width = `${progress}%`;
    }
}

// Função para ir para linha anterior
function previousRow() {
    if (currentRowIndex > 0) {
        currentRowIndex--;
        updateInterface(sheetData[currentRowIndex]);
        updateNavigation();
    } else {
        showStatus('📄 Você já está na primeira linha', 'info');
    }
}

// Função para ir para próxima linha (corrigida - removida a duplicata)
function nextRow() {
    if (currentRowIndex < totalRows - 1) {
        currentRowIndex++;
        updateInterface(sheetData[currentRowIndex]);
        updateNavigation();
    } else {
        showStatus('📄 Você já está na última linha', 'info');
    }
}

function resetImages() {
    // Reset image 1
    const imagePreview1 = document.getElementById('imagePreview1');
    const imageStatus1 = document.getElementById('imageStatus1');
    const generateBtn1 = document.getElementById('generateBtn1');
    const approveBtn1 = document.getElementById('approveBtn1');
    const rejectBtn1 = document.getElementById('rejectBtn1');
    
    if (imagePreview1) {
        imagePreview1.style.display = 'none';
        imagePreview1.src = '';
    }
    
    if (imageStatus1) {
        imageStatus1.textContent = 'Nenhuma imagem gerada';
        imageStatus1.className = 'image-status';
    }
    
    if (generateBtn1) generateBtn1.disabled = false;
    if (approveBtn1) approveBtn1.disabled = true;
    if (rejectBtn1) rejectBtn1.disabled = true;
    
    // Reset app state
    appState.generatedImage = null;
}

async function generateImage(imageNumber) {
    if (currentRowIndex === -1 || !sheetData[currentRowIndex]) {
        showStatus('Nenhuma linha selecionada para gerar imagem');
        return;
    }

    const generateBtn = document.getElementById(`generateBtn${imageNumber}`);
    const imageStatus = document.getElementById(`imageStatus${imageNumber}`);
    const customPromptField = document.getElementById(`customPrompt${imageNumber}`);
    
    if (!generateBtn || !imageStatus) {
        console.error('Elementos não encontrados:', { generateBtn, imageStatus });
        return;
    }
    
    generateBtn.disabled = true;
    generateBtn.textContent = '⏳ Gerando...';
    imageStatus.textContent = 'Gerando imagem...';
    
    try {
        const rowData = sheetData[currentRowIndex];
        
        // Verifica se há prompt personalizado (com verificação defensiva)
        const customPrompt = customPromptField ? customPromptField.value.trim() : '';
        
        const requestBody = {
            rowData: rowData,
            imageNumber: imageNumber
        };
        
        // Se há prompt personalizado, adiciona ao request
        if (customPrompt) {
            requestBody.customPrompt = customPrompt;
        }
        
        console.log('Enviando requisição:', requestBody); // Debug
        
        const response = await fetch('/api/generate-image', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
        });
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const result = await response.json();
        console.log('Resposta recebida:', result); // Debug
        
        if (result.success) {
            const imagePreview = document.getElementById(`imagePreview${imageNumber}`);
            const imagePreviewActions = document.getElementById('imagePreviewActions');
            imagePreview.src = result.imageUrl;
            imagePreview.style.display = 'block';
            imageStatus.textContent = customPrompt ? 'Imagem gerada com prompt personalizado!' : 'Imagem gerada com sucesso!';
            
            // Mostrar botão de visualização em tamanho completo
            if (imagePreviewActions) {
                imagePreviewActions.style.display = 'block';
            }
            
            // Armazenar a URL da imagem gerada no estado da aplicação
            appState.generatedImage = result.imageUrl;
            
            // Habilitar botões de aprovação/reprovação
            const approveBtn = document.getElementById(`approveBtn${imageNumber}`);
            const rejectBtn = document.getElementById(`rejectBtn${imageNumber}`);
            if (approveBtn) approveBtn.disabled = false;
            if (rejectBtn) rejectBtn.disabled = false;
        } else {
            imageStatus.textContent = `Erro: ${result.error}`;
            if (result.error.includes('quota')) {
                const quotaError = document.getElementById('quotaError');
                if (quotaError) quotaError.style.display = 'block';
            }
        }
    } catch (error) {
        console.error('Erro ao gerar imagem:', error);
        imageStatus.textContent = `Erro ao gerar imagem: ${error.message}`;
    } finally {
        generateBtn.disabled = false;
        generateBtn.textContent = '🎨 Gerar';
    }
}

function setupImageButtons(row) {
    const hasImage1 = row.imagem1_url && row.imagem1_url.trim() !== '';
    
    const generateBtn = document.querySelector('[onclick="generateImage(1)"]');
    const approveBtn = document.querySelector('[onclick="approveImage(1)"]');
    const rejectBtn = document.querySelector('[onclick="rejectImage(1)"]');
    
    if (hasImage1) {
        const imagePreview = document.getElementById('imagePreview1');
        const imageStatus = document.getElementById('imageStatus1');
        
        imagePreview.src = row.imagem1_url;
        imagePreview.style.display = 'block';
        imageStatus.textContent = 'Imagem carregada';
        
        generateBtn.disabled = true;
        approveBtn.disabled = true;
        rejectBtn.disabled = true;
    } else if (appState.quotaExceeded) {
        // Se quota foi excedida, manter erro visível e botão desabilitado
        document.getElementById('quotaError').style.display = 'block';
        generateBtn.disabled = true;
    }
}

// Função para aprovar imagem
async function approveImage(imageNumber) {
    if (!appState.generatedImage) {
        showStatus('❌ Nenhuma imagem foi gerada para aprovar', 'error');
        return;
    }

    const approveBtn = document.querySelector(`[onclick="approveImage(${imageNumber})"]`);
    const rejectBtn = document.querySelector(`[onclick="rejectImage(${imageNumber})"]`);
    const imageStatus = document.getElementById(`imageStatus${imageNumber}`);

    try {
        // Desabilitar botões durante o processo
        approveBtn.disabled = true;
        rejectBtn.disabled = true;
        imageStatus.textContent = '💾 Salvando imagem aprovada...';
        imageStatus.className = 'image-status loading';

        const response = await fetch('/api/approve-image', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                imageUrl: appState.generatedImage,
                imageNumber: imageNumber,
                rowIndex: sheetData[currentRowIndex].rowIndex
            })
        });

        if (!response.ok) {
            throw new Error(`Erro HTTP: ${response.status}`);
        }

        const result = await response.json();

        if (!result.success) {
            throw new Error(result.error);
        }

        imageStatus.textContent = '✅ Imagem aprovada e salva!';
        imageStatus.className = 'image-status success';
        
        showStatus('✅ Imagem aprovada e salva na planilha!', 'success');
        
        // Carregar próxima linha após 2 segundos
        setTimeout(() => {
            loadSheetData();
        }, 2000);

    } catch (error) {
        console.error('Erro ao aprovar imagem:', error);
        imageStatus.textContent = '❌ Erro ao salvar imagem';
        imageStatus.className = 'image-status error';
        
        // Reabilitar botões em caso de erro
        approveBtn.disabled = false;
        rejectBtn.disabled = false;
        
        showStatus(`❌ Erro ao aprovar imagem: ${error.message}`, 'error');
    }
}

// Função para rejeitar imagem
function rejectImage(imageNumber) {
    if (!appState.generatedImage) {
        showStatus('❌ Nenhuma imagem foi gerada para rejeitar', 'error');
        return;
    }

    const imagePreview = document.getElementById(`imagePreview${imageNumber}`);
    const imageStatus = document.getElementById(`imageStatus${imageNumber}`);
    const generateBtn = document.querySelector(`[onclick="generateImage(${imageNumber})"]`);
    const approveBtn = document.querySelector(`[onclick="approveImage(${imageNumber})"]`);
    const rejectBtn = document.querySelector(`[onclick="rejectImage(${imageNumber})"]`);

    // Resetar estado da imagem
    appState.generatedImage = null;
    imagePreview.style.display = 'none';
    imagePreview.src = '';
    imageStatus.textContent = 'Imagem rejeitada. Gere uma nova.';
    imageStatus.className = 'image-status';

    // Reabilitar botão de gerar e desabilitar botões de ação
    generateBtn.disabled = false;
    approveBtn.disabled = true;
    rejectBtn.disabled = true;

    showStatus('❌ Imagem rejeitada. Você pode gerar uma nova imagem.', 'info');
}

// Inicialização quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', function() {
    // Carregar dados automaticamente
    loadSheetData();
    
    // Adicionar estilos CSS para os estados de imagem
    const style = document.createElement('style');
    style.textContent = `
        .image-status.loading {
            color: #007bff;
            font-weight: bold;
        }
        .image-status.success {
            color: #28a745;
            font-weight: bold;
        }
        .image-status.error {
            color: #dc3545;
            font-weight: bold;
        }
    `;
    document.head.appendChild(style);
});