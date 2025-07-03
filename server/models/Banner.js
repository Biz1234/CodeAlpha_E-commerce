

const mongoose = require('mongoose');

const bannerSchema = new mongoose.Schema({
  message: {
    type: String,
    required: true
  },
  link: {
    type: String,
    default: '/products'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  expiresAt: {
    type: Date
  }
}, { timestamps: true });


bannerSchema.statics.getActiveBanner = async function () {
  const now = new Date();
  return await this.findOne({ isActive: true, expiresAt: { $gte: now } });
};

module.exports = mongoose.model('Banner', bannerSchema);