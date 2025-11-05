const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// POST /api/auth/register
// Body: { username, email, password, role? }
router.post('/register', async (req, res) => {
  try {
    const { username, email, password, role } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json({ message: 'username, email and password are required' });
    }

    // check for existing username/email
    const existing = await User.findOne({ $or: [{ username }, { email }] });
    if (existing) return res.status(409).json({ message: 'Username or email already in use' });

    // Determine role: use provided role or default to 'Team Members'
    let assignedRole = role || 'Team Members';

    // Create user (password will be hashed by the pre-save hook in User model)
    const user = new User({ username, email, password, role: assignedRole });
    await user.save();

    console.log(`✅ New user registered and saved to MongoDB:`, {
      id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt
    });

    // Generate JWT
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      console.warn('JWT_SECRET not set in environment; issuing token with fallback secret');
    }
    const token = jwt.sign({ id: user._id, role: user.role }, jwtSecret || 'change_this_to_a_strong_secret', { expiresIn: '7d' });

    return res.status(201).json({
      message: 'User registered',
      user: { id: user._id, username: user.username, email: user.email, role: user.role },
      token
    });
  } catch (err) {
    console.error('Registration error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/auth/login
// Body: { login, password } where login can be username or email
router.post('/login', async (req, res) => {
  try {
    const { login, password } = req.body;
    if (!login || !password) {
      return res.status(400).json({ message: 'login (username or email) and password are required' });
    }

    // Find user by username or email
    const user = await User.findOne({ $or: [{ username: login }, { email: login }] });
    if (!user) {
      console.log(`Login failed: user not found for login="${login}"`);
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Compare password using the instance method
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      console.log(`Login failed: password mismatch for user="${user.username}"`);
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    console.log(`Login successful for user="${user.username}"`);


    // Generate JWT
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      console.warn('JWT_SECRET not set in environment; issuing token with fallback secret');
    }
    const token = jwt.sign({ id: user._id, role: user.role }, jwtSecret || 'change_this_to_a_strong_secret', { expiresIn: '7d' });

    return res.status(200).json({
      message: 'Login successful',
      user: { id: user._id, username: user.username, email: user.email, role: user.role },
      token
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/auth/users - Get all users (for debugging/testing)
router.get('/users', async (req, res) => {
  try {
    const users = await User.find({}, 'username email role createdAt');
    return res.status(200).json({
      count: users.length,
      users: users
    });
  } catch (err) {
    console.error('Error fetching users:', err);
    return res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
