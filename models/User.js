const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    username: { type: String, required: true },
    password: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    user_role: { type: String, enum: ['Admin', 'User','Renter'], default: 'User' ,required: false },
    phone: { type: String, required: true },
    address: { type: String, required: true },
    isOnline: { type: Boolean, default: false },
    avatar: {
        url: String,
        public_id: String
    },
}, {
    timestamps: true
}
);

module.exports = mongoose.model('User', userSchema);
