const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Cafe = require('../models/Cafe');

const router = express.Router();

// Register a new cafe
router.post('/register', async (req, res) => {
  try {
    const { email, password, name, cafeName, phone, location, instagram, facebook } = req.body;

    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ msg: 'User already exists' });
    }

    // Create new user
    user = new User({
      email,
      password,
      name,
      role: 'cafe'
    });

    await user.save();

    // Create cafe profile
    const cafe = new Cafe({
      user: user._id,
      name: cafeName,
      email,
      phone,
      location,
      socialMedia: {
        instagram,
        facebook
      }
    });

    await cafe.save();

    // Create JWT
    const payload = {
      user: {
        id: user._id,
        role: user.role
      }
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '7d' },
      (err, token) => {
        if (err) throw err;
        res.json({ token });
      }
    );
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

// Login user
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    // Create JWT
    const payload = {
      user: {
        id: user._id,
        role: user.role
      }
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '7d' },
      (err, token) => {
        if (err) throw err;
        res.json({ token });
      }
    );
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;