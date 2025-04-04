const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const postPackageSchema = new Schema({
  name: { type: String, required: true }, // Tên gói (Ví dụ: "Gói Cơ Bản")
  description: { type: String, required: true }, // Mô tả gói
  price: { type: Number, required: true }, // Giá gói (VND)
  duration: { type: Number, required: true }, // Thời hạn (ngày)
  postLimit: { type: Number, required: true }, // Số bài đăng tối đa
  features: [{ type: String }], // Các tính năng kèm theo
  isActive: { type: Boolean, default: true } 
}, { timestamps: true });

module.exports = mongoose.model('PostPackage', postPackageSchema);