const express = require('express');
const router = express.Router();
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const jwt = require('jsonwebtoken');

// Middleware to verify JWT
const authMiddleware = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

// GET cart
router.get('/', async (req, res) => {
  try {
    const { sessionId } = req.query;
    let cart;
    if (req.header('Authorization')) {
      const token = req.header('Authorization').replace('Bearer ', '');
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      cart = await Cart.findOne({ userId: decoded.userId });
    } else if (sessionId) {
      cart = await Cart.findOne({ sessionId });
    } else {
      return res.status(400).json({ message: 'No session or user ID provided' });
    }
    if (!cart) {
      cart = await Cart.create({ sessionId, userId: req.userId, items: [] });
    }
    await cart.populate('items.productId');
    res.json(cart);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// POST add item to cart
router.post('/', async (req, res) => {
  const { productId, quantity, sessionId } = req.body;
  try {
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    if (product.stock < quantity) {
      return res.status(400).json({ message: 'Insufficient stock' });
    }

    let cart;
    if (req.header('Authorization')) {
      const token = req.header('Authorization').replace('Bearer ', '');
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      cart = await Cart.findOne({ userId: decoded.userId });
    } else if (sessionId) {
      cart = await Cart.findOne({ sessionId });
    }
    if (!cart) {
      cart = await Cart.create({ sessionId, userId: req.userId, items: [] });
    }

    const existingItem = cart.items.find(
      (item) => item.productId.toString() === productId
    );
    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.items.push({ productId, quantity });
    }
    cart.updatedAt = Date.now();
    await cart.save();
    await cart.populate('items.productId');
    res.json(cart);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// PUT update item quantity
router.put('/:productId', async (req, res) => {
  const { quantity, sessionId } = req.body;
  try {
    let cart;
    if (req.header('Authorization')) {
      const token = req.header('Authorization').replace('Bearer ', '');
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      cart = await Cart.findOne({ userId: decoded.userId });
    } else if (sessionId) {
      cart = await Cart.findOne({ sessionId });
    }
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }
    const item = cart.items.find(
      (item) => item.productId.toString() === req.params.productId
    );
    if (!item) {
      return res.status(404).json({ message: 'Item not found in cart' });
    }
    const product = await Product.findById(req.params.productId);
    if (product.stock < quantity) {
      return res.status(400).json({ message: 'Insufficient stock' });
    }
    item.quantity = quantity;
    cart.updatedAt = Date.now();
    await cart.save();
    await cart.populate('items.productId');
    res.json(cart);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// DELETE remove item from cart
router.delete('/:productId', async (req, res) => {
  const { sessionId } = req.query;
  try {
    let cart;
    if (req.header('Authorization')) {
      const token = req.header('Authorization').replace('Bearer ', '');
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      cart = await Cart.findOne({ userId: decoded.userId });
    } else if (sessionId) {
      cart = await Cart.findOne({ sessionId });
    }
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }
    cart.items = cart.items.filter(
      (item) => item.productId.toString() !== req.params.productId
    );
    cart.updatedAt = Date.now();
    await cart.save();
    await cart.populate('items.productId');
    res.json(cart);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;