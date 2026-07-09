const Wishlist = require('../models/Wishlist');
const asyncHandler = require('../utils/asyncHandler');

// Get my wishlist
exports.getMyWishlist = asyncHandler(async (req, res) => {
    let wishlist = await Wishlist.findOne({ user: req.user._id }).populate('pizzas');
    if (!wishlist) wishlist = { pizzas: [] };
    res.json({ status: 'success', wishlist });
});

// Add to wishlist
exports.addToWishlist = asyncHandler(async (req, res) => {
    let wishlist = await Wishlist.findOne({ user: req.user._id });
    if (!wishlist) {
        wishlist = await Wishlist.create({ user: req.user._id, pizzas: [req.body.pizzaId] });
    } else {
        if (!wishlist.pizzas.includes(req.body.pizzaId)) {
            wishlist.pizzas.push(req.body.pizzaId);
            await wishlist.save();
        }
    }
    const populated = await Wishlist.findById(wishlist._id).populate('pizzas');
    res.json({ status: 'success', wishlist: populated });
});

// Remove from wishlist
exports.removeFromWishlist = asyncHandler(async (req, res) => {
    const wishlist = await Wishlist.findOne({ user: req.user._id });
    if (wishlist) {
        wishlist.pizzas = wishlist.pizzas.filter((p) => p.toString() !== req.params.pizzaId);
        await wishlist.save();
    }
    const populated = await Wishlist.findOne({ user: req.user._id }).populate('pizzas');
    res.json({ status: 'success', wishlist: populated || { pizzas: [] } });
});
