const Pizza = require('../models/Pizza');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const cloudinary = require('../config/cloudinary');

// Get all pizzas
exports.getPizzas = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;

    let query = {};

    // Filters
    if (req.query.category) query.category = req.query.category;
    if (req.query.isVeg === 'true') query.isVeg = true;
    if (req.query.isVeg === 'false') query.isVeg = false;
    if (req.query.isFeatured === 'true') query.isFeatured = true;
    if (req.query.minPrice || req.query.maxPrice) {
        query.basePrice = {};
        if (req.query.minPrice) query.basePrice.$gte = Number(req.query.minPrice);
        if (req.query.maxPrice) query.basePrice.$lte = Number(req.query.maxPrice);
    }
    if (req.query.rating) query.rating = { $gte: Number(req.query.rating) };
    if (req.query.search) {
        query.$or = [
            { name: { $regex: req.query.search, $options: 'i' } },
            { description: { $regex: req.query.search, $options: 'i' } },
            { tags: { $regex: req.query.search, $options: 'i' } },
        ];
    }

    query.isAvailable = true;

    // Sort
    let sortBy = '-createdAt';
    if (req.query.sort === 'price-low') sortBy = 'basePrice';
    if (req.query.sort === 'price-high') sortBy = '-basePrice';
    if (req.query.sort === 'rating') sortBy = '-rating';
    if (req.query.sort === 'popular') sortBy = '-totalOrders';
    if (req.query.sort === 'newest') sortBy = '-createdAt';

    const pizzas = await Pizza.find(query).skip(skip).limit(limit).sort(sortBy);
    const total = await Pizza.countDocuments(query);

    res.json({ status: 'success', pizzas, total, pages: Math.ceil(total / limit), page });
});

// Get featured pizzas
exports.getFeaturedPizzas = asyncHandler(async (req, res) => {
    const pizzas = await Pizza.find({ isFeatured: true, isAvailable: true }).limit(8);
    res.json({ status: 'success', pizzas });
});

// Get single pizza
exports.getPizza = asyncHandler(async (req, res, next) => {
    const pizza = await Pizza.findById(req.params.id);
    if (!pizza) return next(new AppError('Pizza not found', 404));
    res.json({ status: 'success', pizza });
});

// Create pizza (admin)
exports.createPizza = asyncHandler(async (req, res) => {
    const pizza = await Pizza.create(req.body);
    res.status(201).json({ status: 'success', pizza });
});

// Update pizza (admin)
exports.updatePizza = asyncHandler(async (req, res, next) => {
    const pizza = await Pizza.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!pizza) return next(new AppError('Pizza not found', 404));
    res.json({ status: 'success', pizza });
});

// Delete pizza (admin)
exports.deletePizza = asyncHandler(async (req, res, next) => {
    const pizza = await Pizza.findByIdAndDelete(req.params.id);
    if (!pizza) return next(new AppError('Pizza not found', 404));
    res.json({ status: 'success', message: 'Pizza deleted' });
});

// Upload image
exports.uploadImage = asyncHandler(async (req, res, next) => {
    if (!req.file) return next(new AppError('Please upload an image', 400));

    const b64 = Buffer.from(req.file.buffer).toString('base64');
    const dataURI = `data:${req.file.mimetype};base64,${b64}`;

    const result = await cloudinary.uploader.upload(dataURI, {
        folder: 'pizzacraft',
        transformation: [{ width: 800, height: 800, crop: 'fill' }],
    });

    res.json({ status: 'success', url: result.secure_url });
});

// Search pizzas
exports.searchPizzas = asyncHandler(async (req, res) => {
    const { q } = req.query;
    if (!q) return res.json({ status: 'success', pizzas: [] });

    const pizzas = await Pizza.find({
        $or: [
            { name: { $regex: q, $options: 'i' } },
            { tags: { $regex: q, $options: 'i' } },
            { category: { $regex: q, $options: 'i' } },
        ],
        isAvailable: true,
    }).limit(10).select('name image basePrice category isVeg rating');

    res.json({ status: 'success', pizzas });
});
