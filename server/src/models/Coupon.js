const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema(
    {
        code: { type: String, required: true, unique: true, uppercase: true, trim: true },
        type: { type: String, enum: ['percentage', 'flat'], required: true },
        discount: { type: Number, required: true },
        maxDiscount: { type: Number, default: 500 },
        minOrder: { type: Number, default: 0 },
        expiryDate: { type: Date, required: true },
        isActive: { type: Boolean, default: true },
        usageLimit: { type: Number, default: 100 },
        usedCount: { type: Number, default: 0 },
        description: String,
    },
    { timestamps: true }
);

module.exports = mongoose.model('Coupon', couponSchema);
