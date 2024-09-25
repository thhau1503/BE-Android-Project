const mongoose = require('mongoose');

const additionalCostsSchema = new mongoose.Schema({
    electricity: { type: Number, default: 0 }, // Giá điện (VNĐ/kWh)
    water: { type: Number, default: 0 }, // Giá nước (VNĐ/m3)
    internet: { type: Number, default: 0 }, // Phí internet/tháng
    cleaningService: { type: Number, default: 0 }, // Phí vệ sinh/tháng
    security: { type: Number, default: 0 } // Phí bảo vệ/tháng
},
{ _id: false });

module.exports = additionalCostsSchema; 
