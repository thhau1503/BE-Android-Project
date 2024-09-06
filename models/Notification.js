const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const notificationSchema = new Schema({
    id_user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    message: { type: String, required: true },
    create_at: { type: Date, default: Date.now },
    status: { type: String, required: true },
});

module.exports = mongoose.model('Notification', notificationSchema);
