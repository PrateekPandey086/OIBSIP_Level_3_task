const router = require('express').Router();
const { getMyWishlist, addToWishlist, removeFromWishlist } = require('../controllers/wishlistController');
const { protect } = require('../middleware/auth');

router.use(protect);
router.get('/', getMyWishlist);
router.post('/', addToWishlist);
router.delete('/:pizzaId', removeFromWishlist);

module.exports = router;
