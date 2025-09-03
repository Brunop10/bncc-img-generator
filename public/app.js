let sheetData = [];
let currentRowIndex = -1;
let totalRows = 0;

let appState = {
    currentRowData: null,
    totalPending: 0,
    generatedImage: null,
    quotaExceeded: false
};

function showStatus(message, type = 'info') {
    const statusDiv = document.getElementById('status');
    statusDiv.innerHTML = `<div class="status ${type}">${message}</div>`;
    
    if (type === 'success' || type === 'error') {
        setTimeout(() => {
            statusDiv.innerHTML = '';
        }, 5000);
    }
}

function clearCustomPrompt() {
    const customPromptField = document.getElementById('customPrompt1');
    if (customPromptField) {
        customPromptField.value = '';
        showStatus('✅ Prompt personalizado limpo!', 'success');
    }
}

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
        
        sheetData = result.allData;
        totalRows = result.totalRows || result.allData.length;
        currentRowIndex = result.currentIndex || 0;
        
        updateInterface(sheetData[currentRowIndex]);
        updateNavigation();
        showStatus(`✅ Dados carregados! Linha ${currentRowIndex + 1} de ${totalRows} (primeira sem imagem)`, 'success');
        
    } catch (error) {
        console.error('Erro ao carregar dados:', error);
        showStatus(`❌ Erro ao carregar dados: ${error.message}`, 'error');
    }
}

function updateInterface(rowData) {
    document.getElementById('description').textContent = rowData.descr_objetivo_ou_habilidade || 'N/A';
    document.getElementById('skill').textContent = rowData.habilidade_superior || 'N/A';
    document.getElementById('explanation').textContent = rowData.explicacao || 'N/A';
    document.getElementById('examples').textContent = rowData.exemplos || 'N/A';
    document.getElementById('step').textContent = rowData.etapa || 'N/A';
    document.getElementById('axes').textContent = rowData.eixo || 'N/A';
    
    const existingImageSection = document.getElementById('existingImageSection');
    const existingImage = document.getElementById('existingImage');
    const noCurrentImage = document.getElementById('noCurrentImage');
    const existingUrlWarning = document.getElementById('existingUrlWarning');
    
    if (rowData.img_url_1) {
        if (existingImageSection) {
            existingImageSection.style.display = 'block';
        }
        if (noCurrentImage) {
            noCurrentImage.style.display = 'none';
        }
        
        if (existingImage) {
            existingImage.src = rowData.img_url_1;
            existingImage.style.display = 'block';
            existingImage.onerror = function() {
                this.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlbSBuw6NvIGVuY29udHJhZGE8L3RleHQ+PC9zdmc+';
                this.style.opacity = '0.5';
            };
        }
        
        if (existingUrlWarning) {
            existingUrlWarning.style.display = 'block';
        }
        
        const approveCurrentBtn = document.getElementById('approveCurrentBtn');
        const rejectCurrentBtn = document.getElementById('rejectCurrentBtn');
        if (approveCurrentBtn) approveCurrentBtn.disabled = false;
        if (rejectCurrentBtn) rejectCurrentBtn.disabled = false;
        
    } else {
        if (existingImageSection) {
            existingImageSection.style.display = 'none';
        }
        if (noCurrentImage) {
            noCurrentImage.style.display = 'flex';
        }
        
        if (existingUrlWarning) {
            existingUrlWarning.style.display = 'none';
        }
        
        const approveCurrentBtn = document.getElementById('approveCurrentBtn');
        const rejectCurrentBtn = document.getElementById('rejectCurrentBtn');
        if (approveCurrentBtn) approveCurrentBtn.disabled = true;
        if (rejectCurrentBtn) rejectCurrentBtn.disabled = true;
    }
    
    resetImages();
    
    document.getElementById('navigation').style.display = 'flex';
    document.getElementById('imageSection').style.display = 'block';
    document.getElementById('rowInfo').style.display = 'block';
}

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

function previousRow() {
    if (currentRowIndex > 0) {
        currentRowIndex--;
        updateInterface(sheetData[currentRowIndex]);
        updateNavigation();
    } else {
        showStatus('📄 Você já está na primeira linha', 'info');
    }
}

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
    const imageContainer = document.getElementById('newImageContainer');
    
    if (!generateBtn || !imageStatus || !imageContainer) {
        console.error('Elementos não encontrados:', { generateBtn, imageStatus, imageContainer });
        return;
    }
    
    const loadingOverlay = document.createElement('div');
    loadingOverlay.className = 'image-loading-overlay';
    loadingOverlay.innerHTML = `
        <div class="spinner"></div>
        <div class="spinner-text">Gerando imagem...</div>
    `;
    
    generateBtn.disabled = true;
    generateBtn.textContent = '⏳ Gerando...';
    
    imageContainer.appendChild(loadingOverlay);

    imageStatus.textContent = '';
    imageStatus.className = 'image-status-external';
    
    try {
        const rowData = sheetData[currentRowIndex];
        
        const customPrompt = customPromptField ? customPromptField.value.trim() : '';
        
        const requestBody = {
            rowData: rowData,
            imageNumber: imageNumber
        };
        
        if (customPrompt) {
            requestBody.customPrompt = customPrompt;
        }
        
        console.log('Enviando requisição:', requestBody); 
        
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
        console.log('Resposta recebida:', result);
        
        if (result.success) {
            const imagePreview = document.getElementById(`imagePreview${imageNumber}`);
            const imagePreviewActions = document.getElementById('imagePreviewActions');
            imagePreview.src = result.imageUrl;
            imagePreview.style.display = 'block';
            imageStatus.textContent = customPrompt ? 'Imagem gerada com prompt personalizado!' : 'Imagem gerada com sucesso!';
            imageStatus.className = 'image-status-external success';
            
            if (imagePreviewActions) {
                imagePreviewActions.style.display = 'block';
            }
            
            appState.generatedImage = result.imageUrl;
            
            const approveBtn = document.getElementById(`approveBtn${imageNumber}`);
            const rejectBtn = document.getElementById(`rejectBtn${imageNumber}`);
            if (approveBtn) approveBtn.disabled = false;
            if (rejectBtn) rejectBtn.disabled = false;
        } else {
            imageStatus.textContent = `Erro: ${result.error}`;
            imageStatus.className = 'image-status-external error';
            if (result.error.includes('quota')) {
                const quotaError = document.getElementById('quotaError');
                if (quotaError) quotaError.style.display = 'block';
            }
        }
    } catch (error) {
        console.error('Erro ao gerar imagem:', error);
        imageStatus.textContent = `Erro ao gerar imagem: ${error.message}`;
        imageStatus.className = 'image-status-external error';
    } finally {
        if (loadingOverlay && loadingOverlay.parentNode) {
            loadingOverlay.parentNode.removeChild(loadingOverlay);
        }
        
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
        document.getElementById('quotaError').style.display = 'block';
        generateBtn.disabled = true;
    }
}

async function approveImage(imageNumber) {
    if (!appState.generatedImage) {
        showStatus('❌ Nenhuma imagem foi gerada para aprovar', 'error');
        return;
    }

    const approveBtn = document.querySelector(`[onclick="approveImage(${imageNumber})"]`);
    const rejectBtn = document.querySelector(`[onclick="rejectImage(${imageNumber})"]`);
    const imageStatus = document.getElementById(`imageStatus${imageNumber}`);

    try {
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
        
        setTimeout(() => {
            loadSheetData();
        }, 2000);

    } catch (error) {
        console.error('Erro ao aprovar imagem:', error);
        imageStatus.textContent = '❌ Erro ao salvar imagem';
        imageStatus.className = 'image-status error';
        
        approveBtn.disabled = false;
        rejectBtn.disabled = false;
        
        showStatus(`❌ Erro ao aprovar imagem: ${error.message}`, 'error');
    }
}

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

    appState.generatedImage = null;
    imagePreview.style.display = 'none';
    imagePreview.src = '';
    imageStatus.textContent = 'Imagem rejeitada. Gere uma nova.';
    imageStatus.className = 'image-status';

    generateBtn.disabled = false;
    approveBtn.disabled = true;
    rejectBtn.disabled = true;

    showStatus('❌ Imagem rejeitada. Você pode gerar uma nova imagem.', 'info');
}

document.addEventListener('DOMContentLoaded', function() {
    loadSheetData();
    
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