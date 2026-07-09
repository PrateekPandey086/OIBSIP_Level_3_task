const router = require('express').Router();
const { createReview, getReviewsByPizza, likeReview, deleteReview } = require('../controllers/reviewController');
const { protect } = require('../middleware/auth');

router.get('/pizza/:pizzaId', getReviewsByPizza);
router.use(protect);
router.post('/', createReview);
router.put('/:id/like', likeReview);
router.delete('/:id', deleteReview);

module.exports = router;
