const express = require('express');
const Cafe = require('../models/Cafe');
const { auth, adminOnly } = require('../utils/authMiddleware');

const router = express.Router();

// Get all cafes (admin only)
router.get('/', [auth, adminOnly], async (req, res) => {
  try {
    const cafes = await Cafe.find().populate('subscriptionPlan');
    res.json(cafes);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

// Get current cafe profile
router.get('/me', auth, async (req, res) => {
  try {
    const cafe = await Cafe.findOne({ user: req.user.id }).populate('subscriptionPlan');
    
    if (!cafe) {
      return res.status(404).json({ msg: 'Cafe profile not found' });
    }

    res.json(cafe);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

// Update cafe profile
router.put('/me', auth, async (req, res) => {
  const { name, phone, location, instagram, facebook, twitter } = req.body;

  try {
    let cafe = await Cafe.findOne({ user: req.user.id });
    
    if (!cafe) {
      return res.status(404).json({ msg: 'Cafe profile not found' });
    }

    cafe.name = name || cafe.name;
    cafe.phone = phone || cafe.phone;
    cafe.location = location || cafe.location;
    cafe.socialMedia.instagram = instagram || cafe.socialMedia.instagram;
    cafe.socialMedia.facebook = facebook || cafe.socialMedia.facebook;
    cafe.socialMedia.twitter = twitter || cafe.socialMedia.twitter;

    await cafe.save();
    res.json(cafe);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;