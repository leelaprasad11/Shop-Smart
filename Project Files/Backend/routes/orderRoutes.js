const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const auth = require('../middleware/authMiddleware');
const checkRole = require('../middleware/roleMiddleware');

// Place a new order
router.post('/', auth, orderController.createOrder);

// Get all orders for the logged-in user
router.get('/my', auth, orderController.getUserOrders);

router.get('/', auth, checkRole(['admin']), orderController.getAllOrders);
router.put('/:id', auth, checkRole(['admin']), orderController.updateOrderStatus);

module.exports = router; 