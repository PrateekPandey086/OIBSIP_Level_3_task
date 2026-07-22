const razorpay = require('../config/razorpay');
const crypto = require('crypto');
const Order = require('../models/Order');
const Payment = require('../models/Payment');
const Notification = require('../models/Notification');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');

// Create Razorpay order
exports.createRazorpayOrder = asyncHandler(async (req, res, next) => {
    const { address, phone, items, couponCode, subtotal, tax, deliveryCharge, discount, total } = req.body;

    // 1. Create MongoDB Order first (status: pending)
    const order = await Order.create({
        user: req.user._id,
        address,
        phone,
        items,
        subtotal,
        tax,
        deliveryCharge,
        discount,
        total,
        coupon: couponCode,
        paymentStatus: 'pending',
        status: 'received',
    });

    // 2. Create Razorpay Order — isolated try-catch so Razorpay errors
    //    (which carry statusCode:401 for bad credentials) are never sent to the
    //    client as 401, which the axios interceptor wrongly treats as session expiry.
    const options = {
        amount: Math.round(total * 100), // Razorpay expects amount in paise
        currency: 'INR',
        receipt: order._id.toString(),
    };

    let razorpayOrder;
    try {
        razorpayOrder = await razorpay.orders.create(options);
    } catch (razorpayError) {
        // Clean up the orphaned MongoDB order so the DB stays consistent
        await Order.findByIdAndDelete(order._id);

        // Log the real Razorpay error for debugging
        console.error('[RAZORPAY] Failed to create order:',
            razorpayError.statusCode,
            razorpayError.error?.description || razorpayError.message
        );

        // Return 502 so the client knows it's a payment gateway issue, not an auth issue
        return next(new AppError(
            `Payment gateway error: ${razorpayError.error?.description || 'Unable to contact Razorpay. Check your API credentials.'}`,
            502
        ));
    }

    res.json({
        status: 'success',
        order: {
            id: razorpayOrder.id,
            amount: razorpayOrder.amount,
            currency: razorpayOrder.currency,
            mongoOrderId: order._id,
        },
        key: process.env.RAZORPAY_KEY_ID,
    });
});

// Verify payment
exports.verifyPayment = asyncHandler(async (req, res, next) => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = req.body;

    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(body)
        .digest('hex');

    const isAuthentic = expectedSignature === razorpay_signature;

    if (!isAuthentic) {
        return next(new AppError('Payment verification failed', 400));
    }

    // Update order
    const order = await Order.findById(orderId);
    if (!order) return next(new AppError('Order not found', 404));

    order.paymentId = razorpay_payment_id;
    order.paymentStatus = 'paid';
    order.status = 'confirmed';
    order.statusHistory.push({ status: 'confirmed', timestamp: new Date(), note: 'Payment received' });
    await order.save();

    // Create payment record
    await Payment.create({
        order: order._id,
        user: req.user._id,
        razorpayOrderId: razorpay_order_id,
        razorpayPaymentId: razorpay_payment_id,
        razorpaySignature: razorpay_signature,
        amount: order.total,
        status: 'captured',
    });

    // Notification
    await Notification.create({
        user: req.user._id,
        title: 'Payment Successful! 💰',
        message: `Payment of ₹${order.total} received for order #${order.orderNumber}`,
        type: 'payment',
        link: `/orders/${order._id}`,
    });

    await Notification.create({
        title: '💰 Payment Received',
        message: `₹${order.total} received for order #${order.orderNumber}`,
        type: 'payment',
        isAdmin: true,
    });

    res.json({ status: 'success', message: 'Payment verified', order });
});
