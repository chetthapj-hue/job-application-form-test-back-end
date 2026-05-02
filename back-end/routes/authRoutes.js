const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');

// @route   POST api/auth/login
// @desc    Authenticate admin & get token
// @access  Public
router.post('/login', async (req, res) => {
  console.log('Login attempt:', req.body); // Debugging log

  const { email, password } = req.body;

  // Simple validation
  if (!email || !password) {
    return res.status(400).json({ message: 'Please provide email and password' });
  }

  try {
    // Check for admin
    let admin = await Admin.findOne({ email });
    if (!admin) {
      console.log('Admin not found for email:', email);
      return res.status(401).json({ message: 'Invalid Credentials' });
    }

    // Validate password
    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      console.log('Password mismatch for email:', email);
      return res.status(401).json({ message: 'Invalid Credentials' });
    }

    // Create JWT Payload
    const payload = {
      admin: {
        id: admin.id,
      },
    };

    // Sign token
    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '1h' },
      (err, token) => {
        if (err) throw err;
        console.log('Login successful for:', email);
        res.json({ token });
      }
    );
  } catch (err) {
    console.error('Server error during login:', err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
