const jwt = require('jsonwebtoken');
const User = require('../models/User');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');

const protect = asyncHandler(async (req, res, next) => {
    console.log("========== AUTH ==========");
    console.log("Authorization:", req.headers.authorization);
    console.log("Cookies:", req.cookies);
    console.log("==========================");
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies && req.cookies.token) {
        token = req.cookies.token;
    }

    if (!token) {
        return next(new AppError('Not authorized, please login', 401));
    }

    try {
        // const decoded = jwt.verify(token, process.env.JWT_SECRET);
        // const user = await User.findById(decoded.id);
        // if (!user) return next(new AppError('User not found', 401));
        // if (user.isDisabled) return next(new AppError('Account is disabled', 403));
        // req.user = user;
        // next();
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        console.log("Decoded Token:", decoded);

        const user = await User.findById(decoded.id);

        console.log("User Found:", user);

        if (!user) {
            return next(new AppError("User not found", 401));
        }

        console.log("Disabled:", user.isDisabled);

        if (user.isDisabled) {
            return next(new AppError("Account is disabled", 403));
        }

        req.user = user;
        next();
    } catch (error) {
        return next(new AppError('Token expired or invalid', 401));
    }
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
