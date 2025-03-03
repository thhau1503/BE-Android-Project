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
    bio: { type: String }, // Tiểu sử người dùng
    followers: [{ type: Schema.Types.ObjectId, ref: 'User' }], // Người theo dõi
    following: [{ type: Schema.Types.ObjectId, ref: 'User' }], // Đang theo dõi
    postCredits: { // Credit để đăng bài
        amount: { type: Number, default: 5 }, // Số lượt đăng còn lại
        lastRefillDate: { type: Date } // Ngày nạp gần nhất
    },
    statistics: { // Thống kê
        totalPosts: { type: Number, default: 0 },
        totalFollowers: { type: Number, default: 0 },
        totalFollowing: { type: Number, default: 0 }
    },
}, {
    timestamps: true
}
);

module.exports = mongoose.model('User', userSchema);
