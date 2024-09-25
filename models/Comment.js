const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const commentSchema = new Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Người đánh giá
    house: { type: mongoose.Schema.Types.ObjectId, ref: 'Post' }, // Nhà trọ được đánh giá
    rating: { type: Number, min: 1, max: 5 },
    comment: String,
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Comment', commentSchema);
