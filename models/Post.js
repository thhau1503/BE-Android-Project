const mongoose = require('mongoose');
const locationSchema = require('./Location');
const amenitiesSchema = require('./Amenity');
const additionalCostsSchema = require('./AdditionalCost');
const Schema = mongoose.Schema;

const postSchema = new Schema({
    title: { type: String, required: true }, // Tiêu đề
    description: { type: String, required: true }, // Mô tả chi tiết
    price: { type: Number, required: true }, // Giá thuê
    location: locationSchema, // Embedded location
    landlord: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Reference người cho thuê
    roomType: { type: String, 
                enum: ['Single', 'Shared', 'Apartment', 'Dormitory'], 
                required: true }, // Loại phòng
    size: { type: Number, required: true }, // Diện tích phòng (m2)
    availability: { type: Boolean, default: true }, // Tình trạng còn trống hay đã thuê
    amenities: amenitiesSchema, // Embedded amenities
    additionalCosts: additionalCostsSchema, // Embedded additional costs
    images: [{ type: String, required: true }], // Danh sách ảnh
    videos: [{ type: String }], // Danh sách video (nếu có)
    averageRating: { type: Number, default: 0 }, // Điểm đánh giá trung bình
    views: { type: Number, default: 0 }, // Số lượt xem
    status: { 
        type: String, 
        enum: ['Active', 'Inactive', 'Deleted'], 
        default: 'active' 
    }, // Trạng thái tin đăng

    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
}, {
    timestamps: true 
});

module.exports = mongoose.model('Post', postSchema);
