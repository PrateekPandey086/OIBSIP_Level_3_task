const AppError = require('../utils/AppError');

const errorHandler = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    if (process.env.NODE_ENV === 'development') {
        return res.status(err.statusCode).json({
            status: err.status,
            error: err,
            message: err.message,
            stack: err.stack,
        });
    }

    // Production
    let error = { ...err, message: err.message };

    // Mongoose bad ObjectId
    if (err.name === 'CastError') {
        error = new AppError('Resource not found', 404);
    }

    // Mongoose duplicate key
    if (err.code === 11000) {
        const field = Object.keys(err.keyValue)[0];
        error = new AppError(`Duplicate value for ${field}`, 400);
    }

    // Mongoose validation error
    if (err.name === 'ValidationError') {
        const messages = Object.values(err.errors).map((val) => val.message);
        error = new AppError(messages.join(', '), 400);
    }

    // JWT errors
    if (err.name === 'JsonWebTokenError') {
        error = new AppError('Invalid token', 401);
    }
    if (err.name === 'TokenExpiredError') {
        error = new AppError('Token expired', 401);
    }

    res.status(error.statusCode || 500).json({
        status: error.status || 'error',
        message: error.message || 'Something went wrong',
    });
};

module.exports = errorHandler;
