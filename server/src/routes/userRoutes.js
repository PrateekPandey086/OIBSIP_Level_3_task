const router = require('express').Router();
const { getUsers, getUser, updateProfile, updatePassword, toggleDisableUser } = require('../controllers/userController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.get('/', authorize('admin'), getUsers);
router.get('/:id', authorize('admin'), getUser);
router.put('/profile', updateProfile);
router.put('/password', updatePassword);
router.put('/:id/toggle-disable', authorize('admin'), toggleDisableUser);

module.exports = router;
