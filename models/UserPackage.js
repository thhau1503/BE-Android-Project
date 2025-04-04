const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userPackageSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  package: { type: Schema.Types.ObjectId, ref: 'PostPackage', required: true },
  purchasedAt: { type: Date, default: Date.now },
  expiresAt: { type: Date, required: true },
  postsLeft: { type: Number, required: true }, 
  isActive: { type: Boolean, default: true },
  paymentId: { type: Schema.Types.ObjectId, ref: 'Transaction' },
}, { timestamps: true });

module.exports = mongoose.model('UserPackage', userPackageSchema);