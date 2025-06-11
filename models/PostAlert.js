const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const postAlertSchema = new Schema({
    user: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    }, 
    criteria: {
        priceMin: { type: Number },
        priceMax: { type: Number },
        roomType: { 
            type: [String], 
            enum: ['Single', 'Double', 'Shared', 'Apartment', 'Dormitory']
        },
        sizeMin: { type: Number },
        sizeMax: { type: Number },
        location: {
            city: { type: String },
            district: { type: String },
            ward: { type: String }
        },
        amenities: {
            wifi: { type: Boolean },
            airConditioner: { type: Boolean },
            parking: { type: Boolean },
            elevator: { type: Boolean },
        }
    },
    isActive: { 
        type: Boolean, 
        default: true 
    },
    emailFrequency: { 
        type: String, 
        enum: ['daily', 'weekly'], 
        default: 'daily' 
    },
}, {
    timestamps: true
});

module.exports = mongoose.model('PostAlert', postAlertSchema);