const Notification = require('../models/Notification');
const asyncHandler = require('../utils/asyncHandler');

// Get my notifications
exports.getMyNotifications = asyncHandler(async (req, res) => {
    const query = req.user.role === 'admin' ? { isAdmin: true } : { user: req.user._id };
    const notifications = await Notification.find(query).sort('-createdAt').limit(50);
    const unreadCount = await Notification.countDocuments({ ...query, isRead: false });
    res.json({ status: 'success', notifications, unreadCount });
});

// Mark as read
exports.markRead = asyncHandler(async (req, res) => {
    await Notification.findByIdAndUpdate(req.params.id, { isRead: true });
    res.json({ status: 'success' });
});

// Mark all as read
exports.markAllRead = asyncHandler(async (req, res) => {
    const query = req.user.role === 'admin' ? { isAdmin: true } : { user: req.user._id };
    await Notification.updateMany(query, { isRead: true });
    res.json({ status: 'success' });
});
