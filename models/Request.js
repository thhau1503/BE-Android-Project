const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const requestSchema = new Schema({
    id_user_rent: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    id_renter: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    id_post: { type: mongoose.Schema.Types.ObjectId, ref: 'Post', required: true },
    date_time: { type: Date, required: true },
    status: { type: String, enum: ['Pending', 'Accepted', 'Declined'], default: 'Pending' }
}, { timestamps: true }
);

module.exports = mongoose.model('Request', requestSchema);
