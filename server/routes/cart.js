const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Cart = require('../models/Cart');
const Product = require('../models/Product');

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
    console.error('GET cart error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// POST add item to cart
router.post('/', async (req, res) => {
  const { productId, quantity, sessionId } = req.body;
  try {
    if (!productId || !quantity || (!sessionId && !req.header('Authorization'))) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
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
    console.log('Cart updated:', cart);
    res.json(cart);
  } catch (err) {
    console.error('POST cart error:', err);
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
    console.error('PUT cart error:', err);
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
    console.error('DELETE cart error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// POST merge guest cart with user cart
router.post('/merge', authMiddleware, async (req, res) => {
  const { sessionId } = req.body;
  try {
    const guestCart = sessionId ? await Cart.findOne({ sessionId }) : null;
    let userCart = await Cart.findOne({ userId: req.userId });

    if (!userCart) {
      userCart = await Cart.create({ userId: req.userId, items: [] });
    }

    if (guestCart && guestCart.items.length > 0) {
      for (const guestItem of guestCart.items) {
        const product = await Product.findById(guestItem.productId);
        if (!product || product.stock < guestItem.quantity) {
          continue; // Skip invalid or out-of-stock items
        }
        const existingItem = userCart.items.find(
          (item) => item.productId.toString() === guestItem.productId.toString()
        );
        if (existingItem) {
          existingItem.quantity += guestItem.quantity;
          if (existingItem.quantity > product.stock) {
            existingItem.quantity = product.stock;
          }
        } else {
          userCart.items.push({
            productId: guestItem.productId,
            quantity: guestItem.quantity
          });
        }
      }
      userCart.updatedAt = Date.now();
      await userCart.save();
      // Delete guest cart
      if (guestCart) {
        await Cart.deleteOne({ sessionId });
      }
    }

    await userCart.populate('items.productId');
    console.log('Merged cart:', userCart);
    res.json(userCart);
  } catch (err) {
    console.error('Merge cart error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;