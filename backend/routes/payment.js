const express = require('express');
const Payment = require('../models/Payment');
const auth = require('../middleware/auth');

const router = express.Router();

// @route   GET api/payments
// @desc    Get all payments for user
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const payments = await Payment.find({ user: req.user.id }).sort({ date: -1 });
    res.json(payments);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/payments/process
// @desc    Process payment
// @access  Private
router.post('/process', auth, async (req, res) => {
  try {
    const { amount, planId, paymentMethodId } = req.body;
    
    // Mock payment processing for now
    const newPayment = new Payment({
      user: req.user.id,
      amount,
      plan: planId,
      status: 'completed',
      stripePaymentId: 'pi_mock_' + Date.now()
    });

    const payment = await newPayment.save();
    res.json(payment);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;