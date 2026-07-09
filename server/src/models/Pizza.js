const mongoose = require('mongoose');

const pizzaSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, trim: true },
        description: { type: String, required: true },
        image: { type: String, required: true },
        images: [String],
        category: {
            type: String,
            enum: ['veg', 'non-veg', 'premium', 'classic', 'special'],
            required: true,
        },
        basePrice: { type: Number, required: true },
        sizes: {
            small: { type: Number, default: 0 },
            medium: { type: Number, default: 100 },
            large: { type: Number, default: 200 },
        },
        ingredients: [String],
        calories: { type: Number, default: 0 },
        cookTime: { type: String, default: '20-25 min' },
        rating: { type: Number, default: 4.5, min: 0, max: 5 },
        reviewCount: { type: Number, default: 0 },
        isVeg: { type: Boolean, default: true },
        isFeatured: { type: Boolean, default: false },
        isAvailable: { type: Boolean, default: true },
        isSeasonal: { type: Boolean, default: false },
        offer: { type: Number, default: 0 },
        tags: [String],
        totalOrders: { type: Number, default: 0 },
    },
    { timestamps: true }
);

pizzaSchema.index({ name: 'text', description: 'text', tags: 'text' });

module.exports = mongoose.model('Pizza', pizzaSchema);
