const router = require('express').Router();
const { getMyRewards, redeemPoints } = require('../controllers/rewardController');
const { protect } = require('../middleware/auth');

router.use(protect);
router.get('/', getMyRewards);
router.post('/redeem', redeemPoints);

module.exports = router;
