const express = require('express');
const Plan = require('../models/Plan');
const Cafe = require('../models/Cafe');
const { auth, adminOnly } = require('../utils/authMiddleware');

const router = express.Router();

// Get all plans
router.get('/', async (req, res) => {
  try {
    const plans = await Plan.find();
    res.json(plans);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

// Create a plan (admin only)
router.post('/', [auth, adminOnly], async (req, res) => {
  const { name, price, features, socialPostFrequency, includesWebStore, description } = req.body;

  try {
    const newPlan = new Plan({
      name,
      price,
      features,
      socialPostFrequency,
      includesWebStore,
      description
    });

    const plan = await newPlan.save();
    res.json(plan);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

// Subscribe to a plan
router.post('/subscribe', auth, async (req, res) => {
  const { planId } = req.body;

  try {
    const plan = await Plan.findById(planId);
    if (!plan) {
      return res.status(404).json({ msg: 'Plan not found' });
    }

    let cafe = await Cafe.findOne({ user: req.user.id });
    if (!cafe) {
      return res.status(404).json({ msg: 'Cafe profile not found' });
    }

    const now = new Date();
    cafe.subscriptionPlan = planId;
    cafe.subscriptionDate = now;
    cafe.nextBillingDate = new Date(now.setMonth(now.getMonth() + 1));

    // If plan includes web store, generate URL
    if (plan.includesWebStore && !cafe.webStoreUrl) {
      const storeId = cafe.name.toLowerCase().replace(/\s+/g, '-');
      cafe.webStoreUrl = `https://cafestores.example.com/${storeId}`;
    }

    await cafe.save();
    res.json({ msg: 'Subscribed to plan successfully', cafe });
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;