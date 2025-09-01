const cloudinary = require('../config/cloudinary');
const config = require('../config/environment');

/**
 * Faz upload de imagem base64 para o Cloudinary
 */
async function uploadBase64Image(base64Data) {
    try {
        const result = await cloudinary.uploader.upload(
            `data:image/png;base64,${base64Data}`,
            {
                folder: config.CLOUDINARY.FOLDER,
                resource_type: 'image',
                format: 'png',
                quality: 'auto:good',
                fetch_format: 'auto'
            }
        );
        return result;
    } catch (error) {
        console.error('Erro ao fazer upload para Cloudinary:', error);
        throw error;
    }
}

/**
 * Salva imagem por URL no Cloudinary
 */
async function saveImageByUrl(imageUrl) {
    try {
        const result = await cloudinary.uploader.upload(imageUrl, {
            folder: config.CLOUDINARY.FOLDER,
            resource_type: 'image'
        });
        
        return {
            success: true,
            url: result.secure_url,
            publicId: result.public_id
        };
    } catch (error) {
        console.error('Erro ao salvar no Cloudinary:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

module.exports = {
    uploadBase64Image,
    saveImageByUrl
};