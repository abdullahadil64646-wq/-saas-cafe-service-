const express = require('express');
const Payment = require('../models/Payment');
const Cafe = require('../models/Cafe');
const Plan = require('../models/Plan');
const { auth } = require('../utils/authMiddleware');

const router = express.Router();

// Process a payment
router.post('/process', auth, async (req, res) => {
  const { planId } = req.body;

  try {
    const cafe = await Cafe.findOne({ user: req.user.id });
    if (!cafe) {
      return res.status(404).json({ msg: 'Cafe profile not found' });
    }

    const plan = await Plan.findById(planId);
    if (!plan) {
      return res.status(404).json({ msg: 'Plan not found' });
    }

    // Generate a unique payment ID
    const paymentId = `PAY-${Date.now()}-${Math.floor(Math.random() * 10000)}`;

    // Create payment record
    const payment = new Payment({
      cafe: cafe._id,
      plan: plan._id,
      amount: plan.price,
      paymentId,
      status: 'completed' // For demo purposes, we're assuming payments always succeed
    });

    await payment.save();

    // Update cafe subscription
    const now = new Date();
    cafe.subscriptionPlan = plan._id;
    cafe.subscriptionDate = now;
    cafe.nextBillingDate = new Date(now.setMonth(now.getMonth() + 1));

    // If plan includes web store, generate URL
    if (plan.includesWebStore && !cafe.webStoreUrl) {
      const storeId = cafe.name.toLowerCase().replace(/\s+/g, '-');
      cafe.webStoreUrl = `https://cafestores.example.com/${storeId}`;
    }

    await cafe.save();

    res.json({ payment, cafe });
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

// Get payment history for current cafe
router.get('/history', auth, async (req, res) => {
  try {
    const cafe = await Cafe.findOne({ user: req.user.id });
    if (!cafe) {
      return res.status(404).json({ msg: 'Cafe profile not found' });
    }

    const payments = await Payment.find({ cafe: cafe._id })
      .populate('plan')
      .sort({ createdAt: -1 });

    res.json(payments);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;