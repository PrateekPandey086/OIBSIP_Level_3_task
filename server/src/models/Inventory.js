const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema(
    {
        name: { type: String, required: true, trim: true },
        category: {
            type: String,
            enum: ['base', 'sauce', 'cheese', 'veggie', 'meat', 'extra'],
            required: true,
        },
        image: { type: String, default: '' },
        quantity: { type: Number, required: true, default: 100 },
        threshold: { type: Number, default: 20 },
        unit: { type: String, default: 'pieces' },
        price: { type: Number, default: 0 },
        status: {
            type: String,
            enum: ['in-stock', 'low-stock', 'out-of-stock'],
            default: 'in-stock',
        },
        stockHistory: [
            {
                action: { type: String, enum: ['added', 'deducted', 'adjusted'] },
                quantity: Number,
                reason: String,
                date: { type: Date, default: Date.now },
            },
        ],
    },
    { timestamps: true }
);

inventorySchema.pre('save', function (next) {
    if (this.quantity <= 0) {
        this.status = 'out-of-stock';
    } else if (this.quantity <= this.threshold) {
        this.status = 'low-stock';
    } else {
        this.status = 'in-stock';
    }
    next();
});

module.exports = mongoose.model('Inventory', inventorySchema);
