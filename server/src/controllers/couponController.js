const Coupon = require('../models/Coupon');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');

// Get all coupons (admin)
exports.getCoupons = asyncHandler(async (req, res) => {
    const coupons = await Coupon.find().sort('-createdAt');
    res.json({ status: 'success', coupons });
});

// Create coupon (admin)
exports.createCoupon = asyncHandler(async (req, res) => {
    const coupon = await Coupon.create(req.body);
    res.status(201).json({ status: 'success', coupon });
});

// Update coupon (admin)
exports.updateCoupon = asyncHandler(async (req, res, next) => {
    const coupon = await Coupon.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!coupon) return next(new AppError('Coupon not found', 404));
    res.json({ status: 'success', coupon });
});

// Delete coupon (admin)
exports.deleteCoupon = asyncHandler(async (req, res, next) => {
    const coupon = await Coupon.findByIdAndDelete(req.params.id);
    if (!coupon) return next(new AppError('Coupon not found', 404));
    res.json({ status: 'success', message: 'Coupon deleted' });
});

// Validate & apply coupon
exports.validateCoupon = asyncHandler(async (req, res, next) => {
    const { code, orderTotal } = req.body;
    const coupon = await Coupon.findOne({ code: code.toUpperCase(), isActive: true });

    if (!coupon) return next(new AppError('Invalid coupon code', 400));
    if (coupon.expiryDate < new Date()) return next(new AppError('Coupon has expired', 400));
    if (coupon.usedCount >= coupon.usageLimit) return next(new AppError('Coupon usage limit reached', 400));
    if (orderTotal < coupon.minOrder) return next(new AppError(`Minimum order of ₹${coupon.minOrder} required`, 400));

    let discount = 0;
    if (coupon.type === 'percentage') {
        discount = (orderTotal * coupon.discount) / 100;
        if (coupon.maxDiscount) discount = Math.min(discount, coupon.maxDiscount);
    } else {
        discount = coupon.discount;
    }

    coupon.usedCount += 1;
    await coupon.save();

    res.json({ status: 'success', discount, coupon: { code: coupon.code, type: coupon.type, discount: coupon.discount } });
});
