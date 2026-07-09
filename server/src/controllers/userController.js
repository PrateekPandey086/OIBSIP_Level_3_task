const User = require('../models/User');
const Order = require('../models/Order');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');

// Get all users (admin)
exports.getUsers = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    const skip = (page - 1) * limit;

    const query = search ? { name: { $regex: search, $options: 'i' }, role: 'customer' } : { role: 'customer' };
    const users = await User.find(query).skip(skip).limit(limit).sort('-createdAt');
    const total = await User.countDocuments(query);

    res.json({ status: 'success', users, total, pages: Math.ceil(total / limit), page });
});

// Get single user (admin)
exports.getUser = asyncHandler(async (req, res, next) => {
    const user = await User.findById(req.params.id);
    if (!user) return next(new AppError('User not found', 404));
    const orders = await Order.find({ user: req.params.id }).sort('-createdAt').limit(10);
    const totalSpending = await Order.aggregate([
        { $match: { user: user._id, paymentStatus: 'paid' } },
        { $group: { _id: null, total: { $sum: '$total' } } },
    ]);
    res.json({ status: 'success', user, orders, totalSpending: totalSpending[0]?.total || 0 });
});

// Update profile
exports.updateProfile = asyncHandler(async (req, res, next) => {
    const { name, phone, avatar, addresses } = req.body;
    const user = await User.findByIdAndUpdate(
        req.user._id,
        { name, phone, avatar, addresses },
        { new: true, runValidators: true }
    );
    res.json({ status: 'success', user });
});

// Update password
exports.updatePassword = asyncHandler(async (req, res, next) => {
    const user = await User.findById(req.user._id).select('+password');
    if (!(await user.comparePassword(req.body.currentPassword))) {
        return next(new AppError('Current password is incorrect', 400));
    }
    user.password = req.body.newPassword;
    await user.save();
    res.json({ status: 'success', message: 'Password updated' });
});

// Toggle disable user (admin)
exports.toggleDisableUser = asyncHandler(async (req, res, next) => {
    const user = await User.findById(req.params.id);
    if (!user) return next(new AppError('User not found', 404));
    user.isDisabled = !user.isDisabled;
    await user.save({ validateBeforeSave: false });
    res.json({ status: 'success', user });
});
