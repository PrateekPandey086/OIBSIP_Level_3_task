const jwt = require('jsonwebtoken');
const User = require('../models/User');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');

const protect = asyncHandler(async (req, res, next) => {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies && req.cookies.token) {
        token = req.cookies.token;
    }

    if (!token) {
        console.warn('[AUTH] No token found in Authorization header or cookies');
        return next(new AppError('Not authorized, please login', 401));
    }

    let decoded;
    try {
        decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
        // Tells us exactly why jwt.verify failed — expired vs wrong secret etc.
        console.error(`[AUTH] jwt.verify failed — name: ${error.name}, msg: ${error.message}`);
        return next(new AppError('Token expired or invalid', 401));
    }

    const user = await User.findById(decoded.id);

    if (!user) {
        // User not in DB — token is valid but the user record is missing
        console.error(`[AUTH] User not found in DB for id: ${decoded.id}`);
        return next(new AppError('User not found', 401));
    }

    if (user.isDisabled) {
        return next(new AppError('Account is disabled', 403));
    }

    req.user = user;
    next();
});

const authorize = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return next(new AppError('Not authorized for this action', 403));
        }
        next();
    };
};

module.exports = { protect, authorize };
