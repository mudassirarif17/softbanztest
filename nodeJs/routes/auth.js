const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Login route
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // For testing: accept any credentials
    const mockUser = {
      _id: '123456789',
      username: username || 'testuser',
      role: 'doctor'
    };

    // Create token
    const token = jwt.sign(
      { userId: mockUser._id, role: mockUser.role },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '1d' }
    );

    // Send response
    res.json({
      token,
      user: {
        id: mockUser._id,
        username: mockUser.username,
        role: mockUser.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Register route (for admin only)
router.post('/register', async (req, res) => {
  try {
    const { username, password, role } = req.body;

    // Check if user exists
    let user = await User.findOne({ username });
    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create new user
    user = new User({
      username,
      password,
      role: role || 'doctor'
    });

    await user.save();

    res.status(201).json({ message: 'User created successfully' });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
