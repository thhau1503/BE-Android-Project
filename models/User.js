const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    username: { type: String, required: true },
    password: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    user_role: { type: String, enum: ['Admin', 'User','Renter'], default: 'User' ,required: false },
    phone: { type: String, required: true },
    address: { type: String, required: true },
    isOnline: { type: Boolean, default: true },
    avatar: {
        url: String,
        public_id: String
    },
    followers: [{ type: Schema.Types.ObjectId, ref: 'User' }], // Danh sách người theo dõi mình
    following: [{ type: Schema.Types.ObjectId, ref: 'User' }], // Danh sách người mình theo dõi
}, {
    timestamps: true
}
);

module.exports = mongoose.model('User', userSchema);
