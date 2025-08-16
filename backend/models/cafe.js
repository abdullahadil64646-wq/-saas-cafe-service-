const mongoose = require('mongoose');

const cafeSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  phone: String,
  location: String,
  socialMedia: {
    instagram: String,
    facebook: String,
    twitter: String
  },
  websiteUrl: String,
  webStoreUrl: String,
  subscriptionPlan: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Plan'
  },
  subscriptionDate: Date,
  nextBillingDate: Date,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Cafe', cafeSchema);