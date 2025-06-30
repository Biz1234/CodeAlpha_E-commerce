const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const authMiddleware = require('../middleware/authMiddleware');

// Optional: Use this if you want admin-only access for some routes
const adminMiddleware = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ message: 'Authentication required' });

  try {
    const decoded = require('jsonwebtoken').verify(token, process.env.JWT_SECRET);
    if (decoded.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }
    req.userId = decoded.userId;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

// 🔒 POST /api/order — Create order (authenticated user)
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { products, totalAmount } = req.body;

    // products should be array of { productId, quantity, price }
    if (!Array.isArray(products) || products.length === 0 || !totalAmount) {
      return res.status(400).json({ message: 'Missing order data' });
    }

    const newOrder = await Order.create({
      userId: req.userId,
      items: products,
      totalAmount
    });

    res.status(201).json(newOrder);
  } catch (err) {
    console.error('Create order error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// 🔒 GET /api/order/user/:userId — Get orders for a specific user
router.get('/user/:userId', authMiddleware, async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.params.userId })
      .populate('items.productId', 'name price image');

    res.json(orders);
  } catch (err) {
    console.error('Get user orders error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// 🔐 GET /api/order — Admin: Get all orders
router.get('/', adminMiddleware, async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('userId', 'name email')
      .populate('items.productId', 'name price image');

    res.json(orders);
  } catch (err) {
    console.error('Get orders error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// 🔐 PUT /api/order/:id — Admin: Update order status
router.put('/:id', adminMiddleware, async (req, res) => {
  try {
    const { status } = req.body;

    if (!['pending', 'processing', 'shipped', 'delivered', 'cancelled'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!updatedOrder) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json(updatedOrder);
  } catch (err) {
    console.error('Update order error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
