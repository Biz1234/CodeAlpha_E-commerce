
const express = require('express');
const router = express.Router();
const Cart = require('../models/Cart');
const Product = require('../models/Product');


// GET cart (for guest or logged-in user)
router.get('/', async (req, res) => {
  try {
    const sessionId = req.query.sessionId; // Temporary for guests
    let cart;
    if (sessionId) {
      cart = await Cart.findOne({ sessionId });
    } else {
      // For logged-in users (to be implemented later)
      return res.status(400).json({ message: 'No session or user ID provided' });
    }
    if (!cart) {
      cart = await Cart.create({ sessionId, items: [] });
    }
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

    let cart = await Cart.findOne({ sessionId });
    if (!cart) {
      cart = await Cart.create({ sessionId, items: [] });
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

    // Populate product details for response
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
    const cart = await Cart.findOne({ sessionId });
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
    const cart = await Cart.findOne({ sessionId });
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