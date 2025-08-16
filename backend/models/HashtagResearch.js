const mongoose = require('mongoose');

const hashtagResearchSchema = new mongoose.Schema({
  cafe: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Cafe',
    required: true
  },
  hashtag: {
    type: String,
    required: true
  },
  platform: {
    type: String,
    enum: ['instagram', 'twitter', 'tiktok', 'linkedin'],
    required: true
  },
  metrics: {
    popularity: Number, // 1-100 score
    competition: Number, // 1-100 score
    engagement: Number, // average engagement rate
    postCount: Number, // total posts with this hashtag
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
      default: 'medium'
    }
  },
  relatedHashtags: [String],
  category: {
    type: String,
    enum: ['food', 'coffee', 'cafe', 'local', 'lifestyle', 'business', 'trending'],
    default: 'cafe'
  },
  trending: {
    isCurrentlyTrending: {
      type: Boolean,
      default: false
    },
    trendingScore: Number,
    peakDate: Date
  },
  seoValue: {
    searchVolume: Number,
    keyword: String,
    localSearchVolume: Number
  },
  recommendations: {
    shouldUse: {
      type: Boolean,
      default: true
    },
    frequency: {
      type: String,
      enum: ['daily', 'weekly', 'monthly', 'special_events'],
      default: 'weekly'
    },
    bestTimeToPost: [String],
    notes: String
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Create compound index for efficient queries
hashtagResearchSchema.index({ cafe: 1, platform: 1, hashtag: 1 }, { unique: true });
hashtagResearchSchema.index({ category: 1, platform: 1 });
hashtagResearchSchema.index({ 'trending.isCurrentlyTrending': 1 });

module.exports = mongoose.model('HashtagResearch', hashtagResearchSchema);