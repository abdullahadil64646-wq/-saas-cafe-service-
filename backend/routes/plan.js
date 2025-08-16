const express = require('express');
const Plan = require('../models/plan');
const auth = require('../middleware/auth');

const router = express.Router();

// @route   GET api/plans
// @desc    Get all plans
// @access  Public
router.get('/', async (req, res) => {
  try {
    const plans = await Plan.find().sort({ price: 1 });
    res.json(plans);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/plans/subscribe
// @desc    Subscribe to a plan
// @access  Private
router.post('/subscribe', auth, async (req, res) => {
  try {
    const { planId } = req.body;
    
    const plan = await Plan.findById(planId);
    if (!plan) {
      return res.status(404).json({ msg: 'Plan not found' });
    }

    // Here you would integrate with Stripe or your payment processor
    // For now, we'll just return success
    res.json({ 
      msg: 'Subscription successful',
      plan: plan.name,
      price: plan.price
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;