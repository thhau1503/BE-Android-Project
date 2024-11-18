const mongoose = require('mongoose');

const locationSchema = new mongoose.Schema({
    address: { type: String, required: true },
    city: { type: String, required: true },
    district: { type: String, required: true },
    ward: { type: String, required: true }, 
    geoLocation: {
        type: { type: String, enum: ['Point'], default: 'Point' },
        coordinates: { type: [Number], required: false } 
    }
},
{ _id: false });

module.exports = locationSchema; 
