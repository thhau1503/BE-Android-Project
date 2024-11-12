const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const contractSchema = new Schema({
    title: { type: String },
    start_at: { type: Date, required: true },
    end_at: { type: Date, required: true },
    rental_price: { type: Number, required: true },
    deposit_amount: { type: Number, required: true },
    contract_file: { type: String, required: true },
    payment_terms: { type: String, required: true },
    penalties: { type: String, required: true },
    maintenance_responsibilities: { type: String, required: true },
    contract_duration: { type: String, required: true },
    renewal_terms: { type: String, required: true },
    termination_conditions: { type: String, required: true },
    additional_clauses: { type: String, required: true },
});

module.exports = mongoose.model('Contract', contractSchema);
