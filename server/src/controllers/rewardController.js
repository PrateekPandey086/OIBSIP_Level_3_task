const Reward = require('../models/Reward');
const User = require('../models/User');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');

// Get my rewards
exports.getMyRewards = asyncHandler(async (req, res) => {
    let reward = await Reward.findOne({ user: req.user._id });
    if (!reward) {
        reward = await Reward.create({ user: req.user._id });
    }
    res.json({ status: 'success', reward });
});

// Redeem points
exports.redeemPoints = asyncHandler(async (req, res, next) => {
    const { points } = req.body;
    const reward = await Reward.findOne({ user: req.user._id });
    if (!reward) return next(new AppError('No rewards found', 404));
    if (reward.points < points) return next(new AppError('Insufficient points', 400));
    if (points < 100) return next(new AppError('Minimum 100 points required to redeem', 400));

    reward.points -= points;
    reward.totalRedeemed += points;
    reward.history.push({ action: 'redeemed', points, description: `Redeemed ${points} points` });
    await reward.save();

    await User.findByIdAndUpdate(req.user._id, { $inc: { rewardPoints: -points } });

    const discount = Math.floor(points / 10); // 10 points = ₹1
    res.json({ status: 'success', discount, remainingPoints: reward.points });
});
