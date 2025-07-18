const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const auth = require('../middleware/authMiddleware');
const checkRole = require('../middleware/roleMiddleware');

// List all products
router.get('/', productController.getAllProducts);
// Get all unique categories
router.get('/categories', productController.getCategories);
// Get product by ID
router.get('/:id', productController.getProductById);
// Create a product (protected, admin only)
router.post('/', auth, checkRole(['admin']), productController.createProduct);
// Update a product (protected, admin only)
router.put('/:id', auth, checkRole(['admin']), productController.updateProduct);
// Delete a product (protected, admin only)
router.delete('/:id', auth, checkRole(['admin']), productController.deleteProduct);

module.exports = router;