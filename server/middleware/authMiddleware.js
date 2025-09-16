const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authMiddleware = async (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get fresh user data including role from DB
    const user = await User.findById(decoded.userId).select('role active');
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    // Attach fresh user data to request
    req.user = {
      userId: decoded.userId,
      email: decoded.email,
      name: decoded.name,
      role: user.role // Always get role from DB
    };

    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      // Optional: Here you could implement refresh token logic
      return res.status(401).json({ 
        message: 'Token expired',
        code: 'TOKEN_EXPIRED'
      });
    }
    res.status(401).json({ 
      message: 'Invalid token',
      error: err.message 
    });
  }
};

const adminMiddleware = async (req, res, next) => {
  try {
    // Double-check role from DB for critical operations
    const user = await User.findById(req.user.userId);
    
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ 
        message: 'Admin access required' 
      });
    }
    
    next();
  } catch (err) {
    res.status(500).json({ 
      message: 'Role verification failed',
      error: err.message 
    });
  }
};

module.exports = { authMiddleware, adminMiddleware };