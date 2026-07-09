const Order = require('../models/Order');
const Pizza = require('../models/Pizza');
const User = require('../models/User');
const Payment = require('../models/Payment');
const Inventory = require('../models/Inventory');
const asyncHandler = require('../utils/asyncHandler');

// Dashboard stats
exports.getDashboardStats = asyncHandler(async (req, res) => {
    const totalRevenue = await Payment.aggregate([
        { $match: { status: 'captured' } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);

    const totalOrders = await Order.countDocuments();
    const pendingOrders = await Order.countDocuments({ status: { $in: ['received', 'confirmed', 'preparing'] } });
    const completedOrders = await Order.countDocuments({ status: 'delivered' });
    const totalCustomers = await User.countDocuments({ role: 'customer' });
    const lowStockItems = await Inventory.countDocuments({ $expr: { $lte: ['$quantity', '$threshold'] } });

    // Recent orders
    const recentOrders = await Order.find().populate('user', 'name email avatar').sort('-createdAt').limit(5);

    res.json({
        status: 'success',
        stats: {
            revenue: totalRevenue[0]?.total || 0,
            totalOrders,
            pendingOrders,
            completedOrders,
            totalCustomers,
            lowStockItems,
        },
        recentOrders,
    });
});

// Revenue analytics
exports.getRevenueAnalytics = asyncHandler(async (req, res) => {
    const days = parseInt(req.query.days) || 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const revenue = await Payment.aggregate([
        { $match: { status: 'captured', createdAt: { $gte: startDate } } },
        {
            $group: {
                _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                total: { $sum: '$amount' },
                count: { $sum: 1 },
            },
        },
        { $sort: { _id: 1 } },
    ]);

    res.json({ status: 'success', revenue });
});

// Popular pizzas
exports.getPopularPizzas = asyncHandler(async (req, res) => {
    const pizzas = await Pizza.find().sort('-totalOrders').limit(10).select('name image totalOrders rating basePrice');
    res.json({ status: 'success', pizzas });
});

// Order analytics
exports.getOrderAnalytics = asyncHandler(async (req, res) => {
    const days = parseInt(req.query.days) || 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const ordersByStatus = await Order.aggregate([
        { $match: { createdAt: { $gte: startDate } } },
        { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    const ordersByDay = await Order.aggregate([
        { $match: { createdAt: { $gte: startDate } } },
        {
            $group: {
                _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                count: { $sum: 1 },
                revenue: { $sum: '$total' },
            },
        },
        { $sort: { _id: 1 } },
    ]);

    res.json({ status: 'success', ordersByStatus, ordersByDay });
});

// Peak hours
exports.getPeakHours = asyncHandler(async (req, res) => {
    const peakHours = await Order.aggregate([
        {
            $group: {
                _id: { $hour: '$createdAt' },
                count: { $sum: 1 },
            },
        },
        { $sort: { _id: 1 } },
    ]);

    res.json({ status: 'success', peakHours });
});

// Inventory consumption
exports.getInventoryConsumption = asyncHandler(async (req, res) => {
    const items = await Inventory.aggregate([
        {
            $project: {
                name: 1,
                category: 1,
                quantity: 1,
                threshold: 1,
                totalDeducted: {
                    $sum: {
                        $map: {
                            input: { $filter: { input: '$stockHistory', as: 'h', cond: { $eq: ['$$h.action', 'deducted'] } } },
                            as: 'h',
                            in: '$$h.quantity',
                        },
                    },
                },
            },
        },
        { $sort: { totalDeducted: -1 } },
        { $limit: 15 },
    ]);

    res.json({ status: 'success', items });
});
