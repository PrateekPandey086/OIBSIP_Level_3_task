const router = require('express').Router();
const { getPizzas, getFeaturedPizzas, getPizza, createPizza, updatePizza, deletePizza, uploadImage, searchPizzas } = require('../controllers/pizzaController');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.get('/', getPizzas);
router.get('/featured', getFeaturedPizzas);
router.get('/search', searchPizzas);
router.get('/:id', getPizza);

router.use(protect, authorize('admin'));
router.post('/', createPizza);
router.put('/:id', updatePizza);
router.delete('/:id', deletePizza);
router.post('/upload', upload.single('image'), uploadImage);

module.exports = router;
