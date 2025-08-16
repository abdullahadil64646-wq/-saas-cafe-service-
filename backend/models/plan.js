const mongoose = require('mongoose');

const planSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  features: [String],
  socialPostFrequency: {
    type: Number,
    default: 0
  },
  includesWebStore: {
    type: Boolean,
    default: false
  },
  description: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Plan', planSchema);