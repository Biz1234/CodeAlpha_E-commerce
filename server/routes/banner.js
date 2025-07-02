const express = require('express');
const router = express.Router();
const Banner = require('../models/Banner');
const { authMiddleware, adminMiddleware } = require('../middleware/authMiddleware');

// POST create banner
router.post('/', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { message, link, isActive, expiresAt } = req.body;
    const banner = await Banner.create({
      message,
      link,
      isActive: isActive !== undefined ? isActive : true,
      expiresAt: expiresAt ? new Date(expiresAt) : undefined,
    });
    res.status(201).json(banner);
  } catch (err) {
    console.error('Create banner error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// GET all banners
router.get('/', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const banners = await Banner.find();
    res.json(banners);
  } catch (err) {
    console.error('Get banners error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// GET active banner
router.get('/active', async (req, res) => {
  try {
    const banner = await Banner.getActiveBanner();
    res.json(banner || {});
  } catch (err) {
    console.error('Get active banner error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// PUT update banner by ID
router.put('/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { message, link, isActive, expiresAt } = req.body;
    const updateData = {
      message,
      link,
      isActive: isActive !== undefined ? isActive : true,
      expiresAt: expiresAt ? new Date(expiresAt) : undefined,
    };
    const banner = await Banner.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!banner) {
      return res.status(404).json({ message: 'Banner not found' });
    }
    res.json(banner);
  } catch (err) {
    console.error('Update banner error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// DELETE banner by ID
router.delete('/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const banner = await Banner.findByIdAndDelete(req.params.id);
    if (!banner) {
      return res.status(404).json({ message: 'Banner not found' });
    }
    res.json({ message: 'Banner deleted' });
  } catch (err) {
    console.error('Delete banner error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;