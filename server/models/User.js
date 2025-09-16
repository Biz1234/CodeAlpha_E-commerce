const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true,
    trim: true
  },
  email: { 
    type: String, 
    required: true, 
    unique: true,
    lowercase: true,
    trim: true
  },
  password: { 
    type: String, 
    required: true,
    select: false // Never return password in queries
  },
  role: { 
    type: String, 
    enum: ['user', 'admin'], 
    default: 'user' 
  },
  cart: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Cart'
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  lastActive: {
    type: Date
  }
}, {
  toJSON: {
    transform: function(doc, ret) {
      delete ret.password; // Ensure password is never returned
      return ret;
    }
  }
});

// Email normalization
userSchema.pre('save', function(next) {
  if (this.isModified('email')) {
    this.email = this.email.toLowerCase().trim();
  }
  next();
});

// Password hashing
userSchema.pre('save', async function(next) {
  // Only hash if password was modified (or new)
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// Method to compare passwords
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Method to generate tokens
userSchema.methods.generateAuthToken = function() {
  return jwt.sign(
    {
      userId: this._id,
      email: this.email,
      name: this.name
      // Note: Role is intentionally not included in token
    },
    process.env.JWT_SECRET,
    { expiresIn: '24h' } // Longer token expiry
  );
};

module.exports = mongoose.model('User', userSchema);