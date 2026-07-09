const Review = require('../models/Review');
const Pizza = require('../models/Pizza');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');

// Create review
exports.createReview = asyncHandler(async (req, res, next) => {
    const { pizza, rating, comment, images } = req.body;
    const existingReview = await Review.findOne({ user: req.user._id, pizza });
    if (existingReview) return next(new AppError('You already reviewed this pizza', 400));

    const review = await Review.create({ user: req.user._id, pizza, rating, comment, images: images || [] });

    // Update pizza rating
    const reviews = await Review.find({ pizza });
    const avgRating = reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length;
    await Pizza.findByIdAndUpdate(pizza, { rating: Math.round(avgRating * 10) / 10, reviewCount: reviews.length });

    const populatedReview = await Review.findById(review._id).populate('user', 'name avatar');
    res.status(201).json({ status: 'success', review: populatedReview });
});

// Get reviews for pizza
exports.getReviewsByPizza = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    let sortBy = '-createdAt';
    if (req.query.sort === 'rating-high') sortBy = '-rating';
    if (req.query.sort === 'rating-low') sortBy = 'rating';
    if (req.query.sort === 'likes') sortBy = '-likes';

    const reviews = await Review.find({ pizza: req.params.pizzaId })
        .populate('user', 'name avatar')
        .skip(skip).limit(limit).sort(sortBy);
    const total = await Review.countDocuments({ pizza: req.params.pizzaId });

    res.json({ status: 'success', reviews, total, pages: Math.ceil(total / limit) });
});

// Like review
exports.likeReview = asyncHandler(async (req, res, next) => {
    const review = await Review.findById(req.params.id);
    if (!review) return next(new AppError('Review not found', 404));

    const idx = review.likes.indexOf(req.user._id);
    if (idx > -1) {
        review.likes.splice(idx, 1);
    } else {
        review.likes.push(req.user._id);
    }
    await review.save();
    res.json({ status: 'success', likes: review.likes.length });
});

// Delete review
exports.deleteReview = asyncHandler(async (req, res, next) => {
    const review = await Review.findById(req.params.id);
    if (!review) return next(new AppError('Review not found', 404));
    if (review.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        return next(new AppError('Not authorized', 403));
    }
    await review.deleteOne();

    // Update pizza rating
    const reviews = await Review.find({ pizza: review.pizza });
    const avgRating = reviews.length > 0 ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length : 0;
    await Pizza.findByIdAndUpdate(review.pizza, { rating: Math.round(avgRating * 10) / 10, reviewCount: reviews.length });

    res.json({ status: 'success', message: 'Review deleted' });
});
