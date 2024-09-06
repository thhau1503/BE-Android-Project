const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const reportSchema = new Schema({
    id_user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    id_post: { type: mongoose.Schema.Types.ObjectId, ref: 'Post', required: true },
    report_reason: { type: String, required: true },
    create_at: { type: Date, default: Date.now },
    status: { type: String, required: true },
});

module.exports = mongoose.model('Report', reportSchema);
