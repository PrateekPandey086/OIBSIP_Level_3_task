const router = require('express').Router();
const { getDashboardStats, getRevenueAnalytics, getPopularPizzas, getOrderAnalytics, getPeakHours, getInventoryConsumption } = require('../controllers/analyticsController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect, authorize('admin'));
router.get('/dashboard', getDashboardStats);
router.get('/revenue', getRevenueAnalytics);
router.get('/popular-pizzas', getPopularPizzas);
router.get('/orders', getOrderAnalytics);
router.get('/peak-hours', getPeakHours);
router.get('/inventory-consumption', getInventoryConsumption);

module.exports = router;
