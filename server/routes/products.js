const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const multer = require('multer');
const path = require('path');

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

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  }
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    if (extname && mimetype) {
      return cb(null, true);
    }
    cb(new Error('Only JPEG/PNG images are allowed'));
  },
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// Serve static files from uploads folder
router.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// POST create product with image (admin only)
router.post('/', adminMiddleware, upload.single('image'), async (req, res) => {
  try {
    const { name, price, description, stock, category } = req.body;
    if (!req.file) {
      return res.status(400).json({ message: 'Image is required' });
    }
    const image = `/uploads/${req.file.filename}`;
    const product = await Product.create({
      name,
      price,
      description,
      image,
      stock,
      category
    });
    res.status(201).json(product);
  } catch (err) {
    console.error('Create product error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// PUT update product (admin only)
router.put('/:id', adminMiddleware, upload.single('image'), async (req, res) => {
  try {
    const { name, price, description, stock, category } = req.body;
    const updateData = { name, price, description, stock, category };
    if (req.file) {
      updateData.image = `/uploads/${req.file.filename}`;
    }
    const product = await Product.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true
    });
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
  } catch (err) {
    console.error('Update product error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// DELETE product (admin only)
router.delete('/:id', adminMiddleware, async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json({ message: 'Product deleted' });
  } catch (err) {
    console.error('Delete product error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// GET all products with search and category filtering
router.get('/', async (req, res) => {
  try {
    const { search, category } = req.query;
    const query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    if (category) {
      query.category = { $regex: `^${category}$`, $options: 'i' };
    }

    const products = await Product.find(query);
    res.json(products);
  } catch (err) {
    console.error('Get products error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// GET unique categories
router.get('/categories', async (req, res) => {
  try {
    const categories = await Product.distinct('category');
    res.json(categories);
  } catch (err) {
    console.error('Get categories error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// GET single product by ID
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
  } catch (err) {
    console.error('Get product error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;