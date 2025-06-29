const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const jwt = require('jsonwebtoken');

// Middleware to check admin role
const adminMiddleware = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ message: 'Authentication required' });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }
    req.userId = decoded.userId;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

// GET all orders (admin only)
router.get('/', adminMiddleware, async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('userId', 'name email')
      .populate('products.productId', 'name price');
    res.json(orders);
  } catch (err) {
    console.error('Get orders error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// PUT update order status (admin only)
router.put('/:id', adminMiddleware, async (req, res) => {
  try {
    const { status } = req.body;
    if (!['pending', 'processing', 'shipped', 'delivered', 'cancelled'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    res.json(order);
  } catch (err) {
    console.error('Update order error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// POST create order (user)
router.post('/', async (req, res) => {
  try {
    const { userId, products, totalAmount } = req.body;
    const order = await Order.create({ userId, products, totalAmount });
    res.status(201).json(order);
  } catch (err) {
    console.error('Create order error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// GET user orders
router.get('/user/:userId', async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.params.userId })
      .populate('products.productId', 'name price');
    res.json(orders);
  } catch (err) {
    console.error('Get user orders error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;