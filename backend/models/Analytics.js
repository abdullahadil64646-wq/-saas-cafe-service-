const mongoose = require('mongoose');

const analyticsSchema = new mongoose.Schema({
  cafe: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Cafe',
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  period: {
    type: String,
    enum: ['daily', 'weekly', 'monthly'],
    required: true
  },
  socialMedia: {
    instagram: {
      followers: Number,
      following: Number,
      posts: Number,
      engagement: {
        likes: Number,
        comments: Number,
        shares: Number,
        saves: Number,
        rate: Number // engagement rate percentage
      },
      reach: Number,
      impressions: Number,
      profileViews: Number
    },
    facebook: {
      likes: Number,
      followers: Number,
      posts: Number,
      engagement: {
        likes: Number,
        comments: Number,
        shares: Number,
        rate: Number
      },
      reach: Number,
      impressions: Number,
      pageViews: Number
    },
    twitter: {
      followers: Number,
      following: Number,
      tweets: Number,
      engagement: {
        likes: Number,
        retweets: Number,
        replies: Number,
        rate: Number
      },
      impressions: Number,
      profileVisits: Number
    }
  },
  website: {
    visitors: Number,
    pageViews: Number,
    bounceRate: Number,
    averageSessionDuration: Number,
    conversions: Number,
    organicTraffic: Number,
    seoRanking: [{
      keyword: String,
      position: Number,
      searchVolume: Number
    }]
  },
  business: {
    leads: {
      generated: Number,
      converted: Number,
      conversionRate: Number
    },
    revenue: Number,
    orders: Number,
    averageOrderValue: Number,
    customerRetention: Number
  },
  campaigns: [{
    campaignId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MarketingCampaign'
    },
    spend: Number,
    impressions: Number,
    clicks: Number,
    conversions: Number,
    cpc: Number, // cost per click
    cpm: Number, // cost per mille
    roas: Number // return on ad spend
  }],
  automatedPosts: {
    scheduled: Number,
    published: Number,
    failed: Number,
    engagement: {
      totalLikes: Number,
      totalComments: Number,
      totalShares: Number,
      averageEngagement: Number
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Create indexes for efficient queries
analyticsSchema.index({ cafe: 1, date: -1 });
analyticsSchema.index({ cafe: 1, period: 1, date: -1 });
analyticsSchema.index({ 'campaigns.campaignId': 1 });

module.exports = mongoose.model('Analytics', analyticsSchema);