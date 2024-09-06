const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const postSchema = new Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    location: { type: String, required: true },
    type: { type: String, required: true },
    features: { type: String, required: true },
    create_at: { type: Date, default: Date.now },
    update_at: { type: Date, default: Date.now },
    image_url: { type: String, required: true },
});

module.exports = mongoose.model('Post', postSchema);
