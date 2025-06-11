const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

const IMAGE_API_URL = 'http://localhost:8000/check-duplicate'; 

exports.checkDuplicateImages = async (imageFiles) => {
  try {
    const formData = new FormData();
    
    imageFiles.forEach(file => {
      formData.append('images', fs.createReadStream(file.path), {
        filename: file.originalname,
        contentType: file.mimetype
      });
    });

    const response = await axios.post(IMAGE_API_URL, formData, {
      headers: formData.getHeaders()
    });

    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    console.error('Error calling image duplicate API:', error);
    return {
      success: false,
      error: error.response?.data?.error || 'Error checking duplicate images'
    };
  }
};