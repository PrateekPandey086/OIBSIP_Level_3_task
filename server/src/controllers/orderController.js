const Order = require('../models/Order');
const Pizza = require('../models/Pizza');
const Notification = require('../models/Notification');
const Reward = require('../models/Reward');
const User = require('../models/User');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const sendEmail = require('../utils/sendEmail');
const { orderConfirmationTemplate } = require('../templates/emailTemplates');
const { deductForOrder } = require('./inventoryController');
const { getIO } = require('../config/socket');

// Create order
exports.createOrder = asyncHandler(async (req, res, next) => {
    const { items, address, phone, deliveryInstructions, coupon, subtotal, tax, deliveryCharge, discount, total } = req.body;

    if (!items || items.length === 0) return next(new AppError('No items in order', 400));

    const order = await Order.create({
        user: req.user._id,
        items,
        address,
        phone,
        deliveryInstructions,
        coupon,
        subtotal,
        tax,
        deliveryCharge,
        discount,
        total,
        estimatedDelivery: '30-45 min',
        statusHistory: [{ status: 'received', timestamp: new Date() }],
    });

    // Deduct inventory
    await deductForOrder(items);

    // Update pizza order counts
    for (const item of items) {
        if (item.pizza) {
            await Pizza.findByIdAndUpdate(item.pizza, { $inc: { totalOrders: item.quantity } });
        }
    }

    // Add reward points (1 point per ₹10 spent)
    const pointsEarned = Math.floor(total / 10);
    const reward = await Reward.findOne({ user: req.user._id });
    if (reward) {
        reward.points += pointsEarned;
        reward.totalEarned += pointsEarned;
        reward.history.push({
            action: 'earned',
            points: pointsEarned,
            description: `Order #${order.orderNumber}`,
            orderId: order._id,
        });

        // Check milestones
        const orderCount = await Order.countDocuments({ user: req.user._id, paymentStatus: 'paid' });
        for (const milestone of reward.milestones) {
            if (!milestone.achieved && orderCount >= milestone.ordersRequired) {
                milestone.achieved = true;
                milestone.achievedDate = new Date();
                const user = await User.findById(req.user._id);
                if (user) {
                    user.badges.push(milestone.name);
                    await user.save({ validateBeforeSave: false });
                }
            }
        }
        await reward.save();
    }

    // Update user reward points
    await User.findByIdAndUpdate(req.user._id, { $inc: { rewardPoints: pointsEarned } });

    // Create notifications
    await Notification.create({
        user: req.user._id,
        title: 'Order Confirmed! 🎉',
        message: `Your order #${order.orderNumber} has been placed.`,
        type: 'order',
        link: `/orders/${order._id}`,
    });

    await Notification.create({
        title: '🔔 New Order Received',
        message: `Order #${order.orderNumber} - ₹${total}`,
        type: 'order',
        isAdmin: true,
        link: `/admin/orders/${order._id}`,
    });

    // Send email
    await sendEmail({
        to: req.user.email,
        subject: `Order Confirmed #${order.orderNumber} - PizzaCraft`,
        html: orderConfirmationTemplate(req.user.name, order.orderNumber, total, items),
    });

    // Socket notification to admin
    try {
        const io = getIO();
        io.to('admin-room').emit('newOrder', { order });
    } catch (e) {
        console.error('Socket error:', e.message);
    }

    res.status(201).json({ status: 'success', order });
});

// Get my orders
exports.getMyOrders = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const orders = await Order.find({ user: req.user._id }).skip(skip).limit(limit).sort('-createdAt');
    const total = await Order.countDocuments({ user: req.user._id });

    res.json({ status: 'success', orders, total, pages: Math.ceil(total / limit), page });
});

// Get all orders (admin)
exports.getAllOrders = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    let query = {};
    if (req.query.status) query.status = req.query.status;
    if (req.query.search) {
        query.$or = [
            { orderNumber: { $regex: req.query.search, $options: 'i' } },
        ];
    }

    const orders = await Order.find(query).populate('user', 'name email phone avatar').skip(skip).limit(limit).sort('-createdAt');
    const total = await Order.countDocuments(query);

    res.json({ status: 'success', orders, total, pages: Math.ceil(total / limit), page });
});

// Get single order
exports.getOrder = asyncHandler(async (req, res, next) => {
    const order = await Order.findById(req.params.id).populate('user', 'name email phone');
    if (!order) return next(new AppError('Order not found', 404));

    // Check if user owns the order or is admin
    if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        return next(new AppError('Not authorized', 403));
    }

    res.json({ status: 'success', order });
});

// Update order status (admin)
exports.updateOrderStatus = asyncHandler(async (req, res, next) => {
    const { status, note } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) return next(new AppError('Order not found', 404));

    order.status = status;
    order.statusHistory.push({ status, timestamp: new Date(), note });
    await order.save();

    // Create notification for user
    const statusMessages = {
        confirmed: 'Your order has been confirmed! 👍',
        preparing: 'Your pizza is being prepared! 👨‍🍳',
        'in-kitchen': 'Your order is in the kitchen! 🔥',
        baking: 'Your pizza is in the oven! 🍕',
        'quality-check': 'Quality check in progress! ✅',
        ready: 'Your order is ready! 📦',
        'out-for-delivery': 'Your order is out for delivery! 🚗',
        delivered: 'Your order has been delivered! 🎉',
        cancelled: 'Your order has been cancelled.',
    };

    await Notification.create({
        user: order.user,
        title: `Order ${status.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}`,
        message: statusMessages[status] || `Order status: ${status}`,
        type: 'order',
        link: `/orders/${order._id}`,
    });

    // Real-time update via Socket.io
    try {
        const io = getIO();
        const payload = {
            orderId: order._id,
            status,
            statusHistory: order.statusHistory,
        };
        // Notify user by userId room
        io.to(order.user.toString()).emit('orderStatusUpdate', payload);
        // Also notify order-specific room (OrderTracking page)
        io.to(`order-${order._id}`).emit('orderStatusUpdate', payload);
    } catch (e) {
        console.error('Socket error:', e.message);
    }

    res.json({ status: 'success', order });
});
