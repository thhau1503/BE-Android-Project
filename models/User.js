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
    avatar: { type: String, default: 'https://t4.ftcdn.net/jpg/05/49/98/39/360_F_549983970_bRCkYfk0P6PP5fKbMhZMIb07mCJ6esXL.jpg' },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
}, {
    timestamps: true
}
);

module.exports = mongoose.model('User', userSchema);
