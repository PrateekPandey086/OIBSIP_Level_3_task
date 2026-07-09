const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
    {
        order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        razorpayOrderId: String,
        razorpayPaymentId: String,
        razorpaySignature: String,
        amount: { type: Number, required: true },
        currency: { type: String, default: 'INR' },
        status: {
            type: String,
            enum: ['created', 'captured', 'failed', 'refunded'],
            default: 'created',
        },
        method: String,
        invoice: String,
    },
    { timestamps: true }
);

module.exports = mongoose.model('Payment', paymentSchema);
