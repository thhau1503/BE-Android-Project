const axios = require('axios');

const PRICE_API_URL = 'http://localhost:6000/evaluate'; 

exports.evaluatePrice = async (area, district, city, price) => {
  try {
    const response = await axios.post(PRICE_API_URL, {
      area,
      district,
      city,
      price
    });
    
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    console.error('Error calling price evaluation API:', error);
    return {
      success: false,
      error: error.response?.data?.error || 'Error evaluating price'
    };
  }
};