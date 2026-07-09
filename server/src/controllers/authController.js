const User = require('../models/User');
const Reward = require('../models/Reward');
const Notification = require('../models/Notification');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const sendEmail = require('../utils/sendEmail');
const { generateToken, generateRefreshToken, generateEmailToken, verifyRefreshToken } = require('../utils/tokenUtils');
const { emailVerificationTemplate, passwordResetTemplate } = require('../templates/emailTemplates');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

// Register
exports.register = asyncHandler(async (req, res, next) => {
    const { name, email, password, phone } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) return next(new AppError('Email already registered', 400));

    const user = await User.create({ name, email, password, phone, role: 'customer' });

    // Create reward record
    await Reward.create({
        user: user._id,
        milestones: [
            { name: 'First Order', ordersRequired: 1 },
            { name: 'Pizza Lover', ordersRequired: 5 },
            { name: 'Pizza Expert', ordersRequired: 10 },
            { name: 'Pizza Master', ordersRequired: 25 },
        ],
    });

    // Send verification email
    const emailToken = generateEmailToken(user._id);
    user.emailVerificationToken = emailToken;
    await user.save({ validateBeforeSave: false });

    const verificationUrl = `${process.env.CLIENT_URL}/verify-email/${emailToken}`;
    await sendEmail({
        to: user.email,
        subject: 'Verify Your Email - PizzaCraft',
        html: emailVerificationTemplate(user.name, verificationUrl),
    });

    // Create notification
    await Notification.create({
        user: user._id,
        title: 'Welcome to PizzaCraft! 🍕',
        message: 'Please verify your email to get started.',
        type: 'system',
    });

    const token = generateToken(user._id, user.role);
    const refreshToken = generateRefreshToken(user._id, user.role);

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(201).json({
        status: 'success',
        token,
        user: { id: user._id, name: user.name, email: user.email, role: user.role, isVerified: user.isVerified },
    });
});

// Login
exports.login = asyncHandler(async (req, res, next) => {
    const { email, password } = req.body;
    if (!email || !password) return next(new AppError('Please provide email and password', 400));

    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
        return next(new AppError('Invalid email or password', 401));
    }
    if (user.isDisabled) return next(new AppError('Account is disabled. Contact support.', 403));

    const token = generateToken(user._id, user.role);
    const refreshToken = generateRefreshToken(user._id, user.role);

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({
        status: 'success',
        token,
        user: { id: user._id, name: user.name, email: user.email, role: user.role, isVerified: user.isVerified, avatar: user.avatar },
    });
});

// Logout
exports.logout = asyncHandler(async (req, res) => {
    if (req.user) {
        req.user.refreshToken = undefined;
        await req.user.save({ validateBeforeSave: false });
    }
    res.cookie('refreshToken', '', { httpOnly: true, expires: new Date(0) });
    res.json({ status: 'success', message: 'Logged out' });
});

// Refresh Token
exports.refreshToken = asyncHandler(async (req, res, next) => {
    const { refreshToken } = req.cookies;
    if (!refreshToken) return next(new AppError('No refresh token', 401));

    try {
        const decoded = verifyRefreshToken(refreshToken);
        const user = await User.findById(decoded.id).select('+refreshToken');
        if (!user || user.refreshToken !== refreshToken) {
            return next(new AppError('Invalid refresh token', 401));
        }

        const newToken = generateToken(user._id, user.role);
        const newRefreshToken = generateRefreshToken(user._id, user.role);

        user.refreshToken = newRefreshToken;
        await user.save({ validateBeforeSave: false });

        res.cookie('refreshToken', newRefreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        res.json({ status: 'success', token: newToken });
    } catch (error) {
        return next(new AppError('Invalid refresh token', 401));
    }
});

// Verify Email
exports.verifyEmail = asyncHandler(async (req, res, next) => {
    const { token } = req.params;
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);
        if (!user) return next(new AppError('Invalid token', 400));

        user.isVerified = true;
        user.emailVerificationToken = undefined;
        await user.save({ validateBeforeSave: false });

        await Notification.create({
            user: user._id,
            title: 'Email Verified! ✅',
            message: 'Your email has been verified successfully.',
            type: 'system',
        });

        res.json({ status: 'success', message: 'Email verified successfully' });
    } catch (error) {
        return next(new AppError('Invalid or expired token', 400));
    }
});

// Forgot Password
exports.forgotPassword = asyncHandler(async (req, res, next) => {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return next(new AppError('No user with that email', 404));

    const resetToken = crypto.randomBytes(32).toString('hex');
    user.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.passwordResetExpires = Date.now() + 3600000; // 1 hour
    await user.save({ validateBeforeSave: false });

    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;
    await sendEmail({
        to: user.email,
        subject: 'Password Reset - PizzaCraft',
        html: passwordResetTemplate(user.name, resetUrl),
    });

    res.json({ status: 'success', message: 'Password reset email sent' });
});

// Reset Password
exports.resetPassword = asyncHandler(async (req, res, next) => {
    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
    const user = await User.findOne({
        passwordResetToken: hashedToken,
        passwordResetExpires: { $gt: Date.now() },
    }).select('+password');

    if (!user) return next(new AppError('Invalid or expired token', 400));

    user.password = req.body.password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    await Notification.create({
        user: user._id,
        title: 'Password Changed 🔐',
        message: 'Your password has been changed successfully.',
        type: 'system',
    });

    res.json({ status: 'success', message: 'Password reset successful' });
});

// Get Me
exports.getMe = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);
    res.json({ status: 'success', user });
});
