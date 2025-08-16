const mongoose = require('mongoose');

const contactLeadSchema = new mongoose.Schema({
  businessName: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  phone: String,
  address: String,
  website: String,
  socialMedia: {
    instagram: String,
    facebook: String,
    twitter: String,
    googleMaps: String
  },
  businessType: {
    type: String,
    default: 'cafe'
  },
  source: {
    type: String,
    enum: ['google_maps', 'facebook', 'instagram', 'website_scraping', 'manual'],
    required: true
  },
  contactStatus: {
    type: String,
    enum: ['new', 'contacted', 'interested', 'converted', 'declined'],
    default: 'new'
  },
  notes: String,
  lastContactDate: Date,
  nextFollowUpDate: Date,
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  tags: [String],
  location: {
    lat: Number,
    lng: Number,
    city: String,
    state: String,
    country: String
  },
  businessHours: [{
    day: String,
    open: String,
    close: String
  }],
  estimatedRevenue: Number,
  employeeCount: Number,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field before saving
contactLeadSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('ContactLead', contactLeadSchema);