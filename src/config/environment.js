require('dotenv').config();

module.exports = {
    PORT: process.env.PORT || 3000,
    
    GEMINI: {
        API_KEY: process.env.GEMINI_API_KEY
    },
    
    CLOUDINARY: {
        CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
        API_KEY: process.env.CLOUDINARY_API_KEY,
        API_SECRET: process.env.CLOUDINARY_API_SECRET,
        FOLDER: process.env.CLOUDINARY_FOLDER || 'curadoria-educacional'
    },
    
    GOOGLE_SHEETS: {
        SHEET_ID: process.env.GOOGLE_SHEET_ID,
        RANGE: process.env.GOOGLE_SHEET_RANGE || 'Sheet1!A:H',
        CREDENTIALS_PATH: './credentials.json'
    }
};