const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
    {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        pizza: { type: mongoose.Schema.Types.ObjectId, ref: 'Pizza', required: true },
        order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
        rating: { type: Number, required: true, min: 1, max: 5 },
        comment: { type: String, required: true },
        images: [String],
        likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    },
    { timestamps: true }
);

reviewSchema.index({ pizza: 1, user: 1 }, { unique: true });

module.exports = mongoose.model('Review', reviewSchema);
