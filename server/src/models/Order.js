const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
    pizza: { type: mongoose.Schema.Types.ObjectId, ref: 'Pizza' },
    name: String,
    image: String,
    quantity: { type: Number, default: 1 },
    size: { type: String, enum: ['small', 'medium', 'large'], default: 'medium' },
    price: Number,
    isCustom: { type: Boolean, default: false },
    customizations: {
        base: { name: String, price: { type: Number, default: 0 } },
        sauce: { name: String, price: { type: Number, default: 0 } },
        cheese: { name: String, price: { type: Number, default: 0 } },
        veggies: [{ name: String, price: { type: Number, default: 0 } }],
        extras: [{ name: String, price: { type: Number, default: 0 } }],
    },
});

const orderSchema = new mongoose.Schema(
    {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        orderNumber: { type: String, unique: true },
        items: [orderItemSchema],
        address: {
            street: String,
            city: String,
            state: String,
            zipCode: String,
        },
        phone: { type: String, required: true },
        deliveryInstructions: String,
        status: {
            type: String,
            enum: [
                'received',
                'confirmed',
                'preparing',
                'in-kitchen',
                'baking',
                'quality-check',
                'ready',
                'out-for-delivery',
                'delivered',
                'cancelled',
            ],
            default: 'received',
        },
        statusHistory: [
            {
                status: String,
                timestamp: { type: Date, default: Date.now },
                note: String,
            },
        ],
        subtotal: { type: Number, required: true },
        tax: { type: Number, default: 0 },
        deliveryCharge: { type: Number, default: 40 },
        discount: { type: Number, default: 0 },
        total: { type: Number, required: true },
        coupon: { type: String, default: '' },
        paymentId: String,
        paymentStatus: {
            type: String,
            enum: ['pending', 'paid', 'failed', 'refunded'],
            default: 'pending',
        },
        estimatedDelivery: String,
        isReviewed: { type: Boolean, default: false },
    },
    { timestamps: true }
);

orderSchema.pre('save', function (next) {
    if (!this.orderNumber) {
        this.orderNumber = 'PC-' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).substring(2, 5).toUpperCase();
    }
    next();
});

module.exports = mongoose.model('Order', orderSchema);
