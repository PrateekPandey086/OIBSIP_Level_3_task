const router = require('express').Router();

const {
    getInventory,
    getByCategory,
    getLowStock,
    createInventory,
    updateInventory,
    updateStock,
    deleteInventory,
} = require('../controllers/inventoryController');

const { protect, authorize } = require('../middleware/auth');

/* ---------------- PUBLIC ROUTES ---------------- */

// Used by Pizza Builder
router.get('/category/:category', getByCategory);

/* ---------------- ADMIN ROUTES ---------------- */

router.get('/', protect, authorize('admin'), getInventory);

router.get('/low-stock', protect, authorize('admin'), getLowStock);

router.post('/', protect, authorize('admin'), createInventory);

router.put('/:id', protect, authorize('admin'), updateInventory);

router.put('/:id/stock', protect, authorize('admin'), updateStock);

router.delete('/:id', protect, authorize('admin'), deleteInventory);

module.exports = router;