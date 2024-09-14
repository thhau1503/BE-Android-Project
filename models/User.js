const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    username: { type: String, required: true },
    password: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    user_role: { type: String, required: false, default: 'USER' },
    phone: { type: String, required: true },
    address: { type: String, required: true },
    create_at: { type: Date, default: Date.now },
    update_at: { type: Date, default: Date.now },
});

module.exports = mongoose.model('User', userSchema);
