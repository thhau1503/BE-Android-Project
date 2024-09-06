const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const commentSchema = new Schema({
    id_user_rent: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    id_post: { type: mongoose.Schema.Types.ObjectId, ref: 'Post', required: true },
    comment_text: { type: String, required: true },
    create_at: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Comment', commentSchema);
