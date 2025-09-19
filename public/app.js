let sheetData = [];
let currentRowIndex = -1;
let totalRows = 0;

let appState = {
    currentRowData: null,
    totalPending: 0,
    imageHistory: [], 
    currentImageIndex: -1, 
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
        showStatus(`✅ Dados carregados! Linha ${currentRowIndex + 1} de ${totalRows}`, 'success');
        
    } catch (error) {
        console.error('Erro ao carregar dados:', error);
        showStatus(`❌ Erro ao carregar dados: ${error.message}`, 'error');
    }
}

function updateInterface(rowData) {
    appState.currentRowData = rowData;
    
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
    const gotoLineInput = document.getElementById('gotoLineInput');
    
    if (prevBtn) prevBtn.disabled = (currentRowIndex <= 0);
    if (nextBtn) nextBtn.disabled = (currentRowIndex >= totalRows - 1);
    
    if (currentRowSpan) {
        currentRowSpan.textContent = currentRowIndex + 1;
    }
    
    if (totalRowsSpan) {
        totalRowsSpan.textContent = totalRows;
    }
    
    if (gotoLineInput) {
        gotoLineInput.max = totalRows;
        gotoLineInput.placeholder = `1-${totalRows}`;
    }

    if (progressFill && totalRows > 0) {
        const progress = ((currentRowIndex + 1) / totalRows) * 100;
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

function gotoLine() {
    const input = document.getElementById('gotoLineInput');
    const lineNumber = parseInt(input.value);
    
    if (!lineNumber || lineNumber < 1 || lineNumber > totalRows) {
        showStatus(`❌ Por favor, digite um número válido entre 1 e ${totalRows}`, 'error');
        input.focus();
        return;
    }
    
    const newIndex = lineNumber - 1;
    
    if (newIndex === currentRowIndex) {
        showStatus(`ℹ️ Você já está na linha ${lineNumber}`, 'info');
        return;
    }
    
    currentRowIndex = newIndex;
    updateInterface(sheetData[currentRowIndex]);
    updateNavigation();
    showStatus(`✅ Navegado para linha ${lineNumber}`, 'success');
    
    input.value = '';
}

function resetImages() {
    appState.imageHistory = [];
    appState.currentImageIndex = -1;
    
    const navigation = document.getElementById('imageNavigation');
    navigation.style.display = 'none';
    
    const imagePreview1 = document.getElementById('imagePreview1');
    const imageStatus1 = document.getElementById('imageStatus1');
    const approveBtn1 = document.getElementById('approveBtn1');
    const rejectBtn1 = document.getElementById('rejectBtn1');
    
    imagePreview1.style.display = 'none';
    imagePreview1.src = '';
    imageStatus1.textContent = 'Nenhuma imagem gerada';
    approveBtn1.disabled = true;
    rejectBtn1.disabled = true;
    
    showStatus('🔄 Imagens resetadas', 'info');
}

function addImageToHistory(imageData) {
    appState.imageHistory.push(imageData);
    appState.currentImageIndex = appState.imageHistory.length - 1;
    requestAnimationFrame(() => {
        updateImageNavigation();
    });
}

function displayCurrentImage() {
    if (appState.currentImageIndex >= 0 && appState.currentImageIndex < appState.imageHistory.length) {
        const currentImage = appState.imageHistory[appState.currentImageIndex];
        const imagePreview = document.getElementById('imagePreview1');
        const imageStatus = document.getElementById('imageStatus1');
        const approveBtn = document.getElementById('approveBtn1');
        const rejectBtn = document.getElementById('rejectBtn1');
        
        requestAnimationFrame(() => {
            imagePreview.src = currentImage.url;
            imagePreview.style.display = 'block';
            
            if (currentImage.approved) {
                imageStatus.textContent = currentImage.status || '✅ Imagem aprovada';
                imageStatus.className = 'image-status-external success';
                approveBtn.disabled = true;
                rejectBtn.disabled = false; 
            } else {
                imageStatus.textContent = currentImage.status || 'Imagem gerada';
                imageStatus.className = 'image-status-external';
                approveBtn.disabled = false;
                rejectBtn.disabled = false;
            }
        });
    }
}

function updateImageNavigation() {
    const navigation = document.getElementById('imageNavigation');
    const positionSpan = document.getElementById('imagePosition');
    const prevBtn = document.getElementById('prevImageBtn');
    const nextBtn = document.getElementById('nextImageBtn');
    
    if (appState.imageHistory.length > 0) {
        navigation.style.display = 'block';
        
        const currentImage = appState.imageHistory[appState.currentImageIndex];
        const statusIcon = currentImage.approved ? ' ✅' : '';
        positionSpan.textContent = `Imagem ${appState.currentImageIndex + 1} de ${appState.imageHistory.length}${statusIcon}`;
        
        prevBtn.disabled = appState.currentImageIndex <= 0;
        nextBtn.disabled = appState.currentImageIndex >= appState.imageHistory.length - 1;
    } else {
        navigation.style.display = 'none';
    }
}

async function generateImage(imageNumber) {
    const generateBtn = document.getElementById(`generateBtn${imageNumber}`);
    const imagePreview = document.getElementById(`imagePreview${imageNumber}`);
    const imageStatus = document.getElementById(`imageStatus${imageNumber}`);
    const approveBtn = document.getElementById(`approveBtn${imageNumber}`);
    const rejectBtn = document.getElementById(`rejectBtn${imageNumber}`);

    generateBtn.disabled = true;
    generateBtn.textContent = '⏳ Gerando...';
    
    approveBtn.disabled = true;
    rejectBtn.disabled = true;
    
    imageStatus.textContent = 'Gerando imagem...';
    imageStatus.className = 'image-status-external loading';

    try {
        const customPrompt = document.getElementById(`customPrompt${imageNumber}`).value.trim();
        
        const response = await fetch('/api/generate-image', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                rowData: appState.currentRowData,
                customPrompt: customPrompt
            })
        });

        const result = await response.json();

        if (response.ok) {
            const imageData = {
                url: result.imageUrl,
                prompt: result.prompt,
                timestamp: new Date().toISOString(),
                status: 'Imagem gerada com sucesso',
                approved: false
            };
            
            addImageToHistory(imageData);
            
            displayCurrentImage();
            
            imageStatus.textContent = 'Imagem gerada com sucesso!';
            imageStatus.className = 'image-status-external success';
            showStatus('✅ Imagem gerada com sucesso!', 'success');
        } else {
            if (result.error === 'QUOTA_EXCEEDED') {
                appState.quotaExceeded = true;
                imageStatus.textContent = 'Cota de geração excedida';
                imageStatus.className = 'image-status-external warning';
                showStatus('⚠️ Cota de geração de imagens excedida. Tente novamente mais tarde.', 'warning');
            } else {
                imageStatus.textContent = `Erro: ${result.error}`;
                imageStatus.className = 'image-status-external error';
                showStatus(`❌ Erro ao gerar imagem: ${result.error}`, 'error');
            }
        }
    } catch (error) {
        console.error('Erro ao gerar imagem:', error);
        imageStatus.textContent = 'Erro na comunicação com o servidor';
        imageStatus.className = 'image-status-external error';
        showStatus('❌ Erro na comunicação com o servidor', 'error');
    } finally {
        // Reabilitar botão
        generateBtn.disabled = false;
        generateBtn.textContent = '🎨 Gerar Imagem';
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
    if (appState.imageHistory.length === 0 || appState.currentImageIndex === -1) {
        showStatus('❌ Nenhuma imagem foi gerada para aprovar', 'error');
        return;
    }

    const currentImage = appState.imageHistory[appState.currentImageIndex];
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
                imageUrl: currentImage.url,
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

        sheetData[currentRowIndex].img_url_1 = currentImage.url;
        
        const existingImageSection = document.getElementById('existingImageSection');
        const existingImage = document.getElementById('existingImage');
        const noCurrentImage = document.getElementById('noCurrentImage');
        const existingUrlWarning = document.getElementById('existingUrlWarning');
        
        if (existingImageSection) {
            existingImageSection.style.display = 'block';
        }
        if (noCurrentImage) {
            noCurrentImage.style.display = 'none';
        }
        
        if (existingImage) {
            existingImage.src = currentImage.url;
            existingImage.style.display = 'block';
        }
        
        if (existingUrlWarning) {
            existingUrlWarning.style.display = 'block';
        }
        
        const approveCurrentBtn = document.getElementById('approveCurrentBtn');
        const rejectCurrentBtn = document.getElementById('rejectCurrentBtn');
        if (approveCurrentBtn) approveCurrentBtn.disabled = false;
        if (rejectCurrentBtn) rejectCurrentBtn.disabled = false;
        
        appState.imageHistory[appState.currentImageIndex].approved = true;
        appState.imageHistory[appState.currentImageIndex].status = '✅ Imagem aprovada e salva!';

        imageStatus.textContent = '✅ Imagem aprovada e salva!';
        imageStatus.className = 'image-status success';
        
        showStatus('✅ Imagem aprovada e salva na planilha!', 'success');

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
    if (appState.imageHistory.length === 0 || appState.currentImageIndex === -1) {
        showStatus('❌ Nenhuma imagem foi gerada para rejeitar', 'error');
        return;
    }

    appState.imageHistory.splice(appState.currentImageIndex, 1);
    
    if (appState.imageHistory.length === 0) {
        appState.currentImageIndex = -1;
        const imagePreview = document.getElementById(`imagePreview${imageNumber}`);
        const imageStatus = document.getElementById(`imageStatus${imageNumber}`);
        const generateBtn = document.querySelector(`[onclick="generateImage(${imageNumber})"]`);
        const approveBtn = document.querySelector(`[onclick="approveImage(${imageNumber})"]`);
        const rejectBtn = document.querySelector(`[onclick="rejectImage(${imageNumber})"]`);

        imagePreview.style.display = 'none';
        imagePreview.src = '';
        imageStatus.textContent = 'Imagem rejeitada e removida do histórico.';
        imageStatus.className = 'image-status';

        generateBtn.disabled = false;
        approveBtn.disabled = true;
        rejectBtn.disabled = true;
        
        updateImageNavigation();
        
    } else {
        if (appState.currentImageIndex >= appState.imageHistory.length) {
            appState.currentImageIndex = appState.imageHistory.length - 1;
        }
        
        displayCurrentImage();
        updateImageNavigation();
    }

    showStatus('🗑️ Imagem rejeitada e removida do histórico', 'info');
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

function showPreviousImage() {
    if (appState.currentImageIndex > 0) {
        appState.currentImageIndex--;
        displayCurrentImage();
        updateImageNavigation();
    }
}

function showNextImage() {
    if (appState.currentImageIndex < appState.imageHistory.length - 1) {
        appState.currentImageIndex++;
        displayCurrentImage();
        updateImageNavigation();
    }
}