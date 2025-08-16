const mongoose = require('mongoose');

const marketingCampaignSchema = new mongoose.Schema({
  cafe: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Cafe',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['social_media', 'email', 'seo', 'paid_ads', 'content_marketing'],
    required: true
  },
  status: {
    type: String,
    enum: ['draft', 'active', 'paused', 'completed', 'cancelled'],
    default: 'draft'
  },
  platforms: [{
    type: String,
    enum: ['instagram', 'facebook', 'twitter', 'google', 'email']
  }],
  targetAudience: {
    ageRange: String,
    interests: [String],
    location: String,
    demographics: String
  },
  budget: {
    total: Number,
    daily: Number,
    currency: {
      type: String,
      default: 'USD'
    }
  },
  schedule: {
    startDate: Date,
    endDate: Date,
    postFrequency: Number, // posts per day/week
    timeSlots: [String] // preferred posting times
  },
  content: {
    hashtags: [String],
    keywords: [String],
    contentTemplates: [String],
    imageUrls: [String]
  },
  automation: {
    zapierWebhookUrl: String,
    autoPost: {
      type: Boolean,
      default: false
    },
    autoRespond: {
      type: Boolean,
      default: false
    },
    contentGeneration: {
      type: Boolean,
      default: true
    }
  },
  metrics: {
    impressions: {
      type: Number,
      default: 0
    },
    clicks: {
      type: Number,
      default: 0
    },
    engagements: {
      type: Number,
      default: 0
    },
    conversions: {
      type: Number,
      default: 0
    },
    spend: {
      type: Number,
      default: 0
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

marketingCampaignSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('MarketingCampaign', marketingCampaignSchema);