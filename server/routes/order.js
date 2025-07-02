const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const { authMiddleware, adminMiddleware } = require('../middleware/authMiddleware');

// ✅ Create new order (authenticated user)
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { items, totalAmount } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'Items are required' });
    }

    if (!totalAmount || totalAmount <= 0) {
      return res.status(400).json({ message: 'Invalid total amount' });
    }

    const newOrder = await Order.create({
      userId: req.user.userId,
      items,
      totalAmount,
      status: 'pending',
    });

    const populatedOrder = await Order.findById(newOrder._id)
      .populate('userId', 'name email')
      .populate('items.productId', 'name price image');

    res.status(201).json(populatedOrder);
  } catch (err) {
    console.error('Create order error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// ✅ Get all orders (admin only)
router.get('/', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('userId', 'name email')
      .populate('items.productId', 'name price image');

    res.json(orders);
  } catch (err) {
    console.error('Get all orders error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// ✅ Get orders by user ID (authenticated user)
router.get('/user/:id', authMiddleware, async (req, res) => {
  try {
    // Ensure user can only access their own orders (unless admin)
    if (req.user.userId !== req.params.id && !req.user.isAdmin) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const orders = await Order.find({ userId: req.params.id })
      .populate('items.productId', 'name price image');

    res.json(orders);
  } catch (err) {
    console.error('Get user orders error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// ✅ Update order status (admin only)
router.put('/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { status } = req.body;

    const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    )
      .populate('userId', 'name email')
      .populate('items.productId', 'name price image');

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
