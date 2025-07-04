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
                enum: ['Single','Double', 'Shared', 'Apartment', 'Dormitory'], 
                required: true }, // Loại phòng
    size: { type: Number, required: true }, // Diện tích phòng (m2)
    availability: { type: Boolean, default: true }, // Tình trạng còn trống hay đã thuê
    amenities: amenitiesSchema, // Embedded amenities
    additionalCosts: additionalCostsSchema, // Embedded additional costs
    images: [{ 
        url: { type: String, required: true },
        public_id: { type: String, required: true }
    }], // Danh sách ảnh
    videos: [{ 
        url: { type: String, required: true },
        public_id: { type: String, required: true }
    }], // Danh sách video 
    averageRating: { type: Number, default: 0 }, // Điểm đánh giá trung bình
    views: { type: Number, default: 0 }, // Số lượt xem
    status: { 
        type: String, 
        enum: ['Active', 'Inactive', 'Deleted', 'Pending', 'Locked'], 
        default: 'Pending' 
    }, // Trạng thái tin đăng
    priceEvaluation: {
      evaluation: { type: String }, // "Giá cao so với khu vực", "Giá thấp so với khu vực", etc.
      level: { type: String }, // "high", "low", "normal"
      predictedPrice: { type: Number },
      priceDifference: { type: Number },
      pricePercentage: { type: Number },
      districtStats: {
        meanPrice: { type: Number },
        minPrice: { type: Number },
        maxPrice: { type: Number }
      }
    },
    imageCheck: {
      hasDuplicates: { type: Boolean, default: false },
      duplicateDetails: [{
        url: { type: String },
        matchedWith: { type: String },
        matchedPostId: { type: mongoose.Schema.Types.ObjectId, ref: 'Post' }
      }]
    },
    warnings: [{ type: String }]
}, {
    timestamps: true 
});

module.exports = mongoose.model('Post', postSchema);
