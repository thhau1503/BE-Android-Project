const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const creditPackageSchema = new Schema({
    name: { type: String, required: true },
    credits: { type: Number, required: true },
    price: { type: Number, required: true },
    description: String,
    isActive: { type: Boolean, default: true }
}, {
    timestamps: true
});

module.exports = mongoose.model('CreditPackage', creditPackageSchema);