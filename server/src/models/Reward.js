const mongoose = require('mongoose');

const rewardSchema = new mongoose.Schema(
    {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
        points: { type: Number, default: 0 },
        totalEarned: { type: Number, default: 0 },
        totalRedeemed: { type: Number, default: 0 },
        history: [
            {
                action: { type: String, enum: ['earned', 'redeemed'] },
                points: Number,
                description: String,
                orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
                date: { type: Date, default: Date.now },
            },
        ],
        milestones: [
            {
                name: String,
                ordersRequired: Number,
                achieved: { type: Boolean, default: false },
                achievedDate: Date,
            },
        ],
    },
    { timestamps: true }
);

module.exports = mongoose.model('Reward', rewardSchema);
