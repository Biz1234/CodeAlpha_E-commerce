const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Cart = require('../models/Cart');
const Product = require('../models/product');

// 🔐 Middleware to verify JWT and set req.userId
const authMiddleware = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ message: 'No token provided' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

// ✅ GET /api/cart
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
      return res.status(400).json({ message: 'No session or token provided' });
    }

    if (!cart) {
      cart = await Cart.create({ sessionId, items: [] });
    }

    await cart.populate('items.productId');
    res.json(cart);
  } catch (err) {
    console.error('GET cart error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// ✅ POST /api/cart — Add item to cart
router.post('/', async (req, res) => {
  const { productId, quantity, sessionId } = req.body;

  if (!productId || !quantity || (!sessionId && !req.header('Authorization'))) {
    return res.status(400).json({ message: 'Missing fields' });
  }

  try {
    const product = await Product.findById(productId);
    if (!product || product.stock < quantity) {
      return res.status(400).json({ message: 'Invalid product or insufficient stock' });
    }

    let cart;
    let userId = null;

    if (req.header('Authorization')) {
      const token = req.header('Authorization').replace('Bearer ', '');
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      userId = decoded.userId;
      cart = await Cart.findOne({ userId });
    } else if (sessionId) {
      cart = await Cart.findOne({ sessionId });
    }

    if (!cart) {
      cart = await Cart.create({ sessionId, userId, items: [] });
    }

    const existingItem = cart.items.find(
      (item) => item.productId.toString() === productId
    );

    if (existingItem) {
      existingItem.quantity += quantity;
      if (existingItem.quantity > product.stock) {
        existingItem.quantity = product.stock;
      }
    } else {
      cart.items.push({ productId, quantity });
    }

    cart.updatedAt = Date.now();
    await cart.save();
    await cart.populate('items.productId');

    res.json(cart);
  } catch (err) {
    console.error('POST cart error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// ✅ PUT /api/cart/:productId — Update quantity
router.put('/:productId', async (req, res) => {
  const { quantity, sessionId } = req.body;

  if (quantity === undefined || quantity < 0) {
    return res.status(400).json({ message: 'Invalid quantity' });
  }

  try {
    let cart;
    if (req.header('Authorization')) {
      const token = req.header('Authorization').replace('Bearer ', '');
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      cart = await Cart.findOne({ userId: decoded.userId });
    } else if (sessionId) {
      cart = await Cart.findOne({ sessionId });
    }

    if (!cart) return res.status(404).json({ message: 'Cart not found' });

    const item = cart.items.find(
      (item) => item.productId.toString() === req.params.productId
    );

    if (!item) return res.status(404).json({ message: 'Item not in cart' });

    const product = await Product.findById(item.productId);
    if (!product || product.stock < quantity) {
      return res.status(400).json({ message: 'Invalid product or insufficient stock' });
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

// ✅ DELETE /api/cart/:productId — Remove item from cart
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

    if (!cart) return res.status(404).json({ message: 'Cart not found' });

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

// ✅ POST /api/cart/merge — Merge guest cart into user cart after login
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
        if (!product || product.stock < guestItem.quantity) continue;

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

      await userCart.save();
      await Cart.deleteOne({ sessionId });
    }

    await userCart.populate('items.productId');
    res.json(userCart);
  } catch (err) {
    console.error('Merge cart error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
