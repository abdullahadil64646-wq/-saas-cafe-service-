const mongoose = require('mongoose');

const socialPostSchema = new mongoose.Schema({
  cafe: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Cafe',
    required: true
  },
  platform: {
    type: String,
    enum: ['instagram', 'facebook', 'twitter'],
    required: true
  },
  contentType: {
    type: String,
    enum: ['image', 'text', 'video', 'carousel'],
    default: 'image'
  },
  content: String,
  imageUrl: String,
  scheduledDate: Date,
  status: {
    type: String,
    enum: ['pending', 'ready', 'scheduled', 'posted', 'failed'],
    default: 'pending'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('SocialPost', socialPostSchema);