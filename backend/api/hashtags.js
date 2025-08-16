const express = require('express');
const HashtagResearch = require('../models/HashtagResearch');
const Cafe = require('../models/Cafe');
const { auth } = require('../utils/authMiddleware');

const router = express.Router();

// Get hashtag research for current cafe
router.get('/', auth, async (req, res) => {
  try {
    const cafe = await Cafe.findOne({ user: req.user.id });
    if (!cafe) {
      return res.status(404).json({ msg: 'Cafe profile not found' });
    }

    const { platform, category, trending } = req.query;
    const filter = { cafe: cafe._id };

    if (platform) filter.platform = platform;
    if (category) filter.category = category;
    if (trending === 'true') filter['trending.isCurrentlyTrending'] = true;

    const hashtags = await HashtagResearch.find(filter)
      .sort({ 'metrics.popularity': -1 });

    res.json(hashtags);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

// Research new hashtags
router.post('/research', auth, async (req, res) => {
  try {
    const cafe = await Cafe.findOne({ user: req.user.id });
    if (!cafe) {
      return res.status(404).json({ msg: 'Cafe profile not found' });
    }

    const { keywords, platforms = ['instagram'], location } = req.body;

    if (!keywords || !Array.isArray(keywords)) {
      return res.status(400).json({ msg: 'Keywords array is required' });
    }

    const researchResults = [];

    for (const platform of platforms) {
      for (const keyword of keywords) {
        const hashtags = await researchHashtagsForKeyword(keyword, platform, location);
        
        for (const hashtagData of hashtags) {
          // Check if hashtag already exists
          const existingHashtag = await HashtagResearch.findOne({
            cafe: cafe._id,
            hashtag: hashtagData.hashtag,
            platform
          });

          if (existingHashtag) {
            // Update existing data
            Object.assign(existingHashtag, hashtagData);
            existingHashtag.lastUpdated = new Date();
            await existingHashtag.save();
            researchResults.push(existingHashtag);
          } else {
            // Create new research entry
            const newResearch = new HashtagResearch({
              cafe: cafe._id,
              platform,
              ...hashtagData
            });
            const savedResearch = await newResearch.save();
            researchResults.push(savedResearch);
          }
        }
      }
    }

    res.json({
      msg: `Researched ${researchResults.length} hashtags`,
      results: researchResults
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

// Get hashtag recommendations
router.get('/recommendations', auth, async (req, res) => {
  try {
    const cafe = await Cafe.findOne({ user: req.user.id });
    if (!cafe) {
      return res.status(404).json({ msg: 'Cafe profile not found' });
    }

    const { platform = 'instagram', type = 'balanced' } = req.query;

    let filter = { 
      cafe: cafe._id, 
      platform,
      'recommendations.shouldUse': true
    };

    let sort = {};

    // Adjust recommendations based on type
    switch (type) {
      case 'trending':
        filter['trending.isCurrentlyTrending'] = true;
        sort = { 'trending.trendingScore': -1 };
        break;
      case 'low_competition':
        filter['metrics.competition'] = { $lt: 30 };
        sort = { 'metrics.competition': 1 };
        break;
      case 'high_engagement':
        filter['metrics.engagement'] = { $gt: 3 };
        sort = { 'metrics.engagement': -1 };
        break;
      case 'local':
        filter.category = 'local';
        sort = { 'metrics.popularity': -1 };
        break;
      default: // balanced
        sort = { 'metrics.popularity': -1, 'metrics.competition': 1 };
    }

    const recommendations = await HashtagResearch.find(filter)
      .sort(sort)
      .limit(20);

    // Generate hashtag sets
    const hashtagSets = generateHashtagSets(recommendations);

    res.json({
      recommendations,
      hashtagSets,
      analytics: {
        totalHashtags: recommendations.length,
        averagePopularity: recommendations.length > 0 
          ? recommendations.reduce((sum, h) => sum + h.metrics.popularity, 0) / recommendations.length 
          : 0,
        averageCompetition: recommendations.length > 0
          ? recommendations.reduce((sum, h) => sum + h.metrics.competition, 0) / recommendations.length
          : 0,
        trendingCount: recommendations.filter(h => h.trending.isCurrentlyTrending).length
      }
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

// Update hashtag research data
router.put('/:id', auth, async (req, res) => {
  try {
    const cafe = await Cafe.findOne({ user: req.user.id });
    if (!cafe) {
      return res.status(404).json({ msg: 'Cafe profile not found' });
    }

    const hashtag = await HashtagResearch.findOneAndUpdate(
      { _id: req.params.id, cafe: cafe._id },
      { 
        ...req.body,
        lastUpdated: new Date()
      },
      { new: true }
    );

    if (!hashtag) {
      return res.status(404).json({ msg: 'Hashtag research not found' });
    }

    res.json(hashtag);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

// Delete hashtag research
router.delete('/:id', auth, async (req, res) => {
  try {
    const cafe = await Cafe.findOne({ user: req.user.id });
    if (!cafe) {
      return res.status(404).json({ msg: 'Cafe profile not found' });
    }

    const hashtag = await HashtagResearch.findOneAndDelete({
      _id: req.params.id,
      cafe: cafe._id
    });

    if (!hashtag) {
      return res.status(404).json({ msg: 'Hashtag research not found' });
    }

    res.json({ msg: 'Hashtag research deleted successfully' });
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

// Get trending hashtags
router.get('/trending', auth, async (req, res) => {
  try {
    const { platform = 'instagram' } = req.query;

    // Mock trending hashtags - in production, this would connect to social media APIs
    const trendingHashtags = await generateTrendingHashtags(platform);

    res.json(trendingHashtags);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

// Mock function to research hashtags for a keyword
async function researchHashtagsForKeyword(keyword, platform, location) {
  // Mock hashtag research - in production, this would use social media APIs
  const baseHashtags = [
    keyword.toLowerCase(),
    `${keyword}love`,
    `${keyword}life`,
    `local${keyword}`,
    `best${keyword}`,
    `fresh${keyword}`
  ];

  const cafeSpecificHashtags = [
    'coffee', 'coffeetime', 'coffeelover', 'cafe', 'cafelife',
    'espresso', 'latte', 'cappuccino', 'barista', 'coffeeart',
    'localbusiness', 'smallbusiness', 'artisancoffee', 'specialtycoffee'
  ];

  const allHashtags = [...baseHashtags, ...cafeSpecificHashtags];

  return allHashtags.map(hashtag => ({
    hashtag: `#${hashtag}`,
    metrics: {
      popularity: Math.floor(Math.random() * 100) + 1,
      competition: Math.floor(Math.random() * 100) + 1,
      engagement: (Math.random() * 10).toFixed(2),
      postCount: Math.floor(Math.random() * 1000000) + 1000,
      difficulty: ['easy', 'medium', 'hard'][Math.floor(Math.random() * 3)]
    },
    relatedHashtags: generateRelatedHashtags(hashtag),
    category: categorizeHashtag(hashtag),
    trending: {
      isCurrentlyTrending: Math.random() > 0.8,
      trendingScore: Math.floor(Math.random() * 100),
      peakDate: new Date()
    },
    seoValue: {
      searchVolume: Math.floor(Math.random() * 10000) + 100,
      keyword: hashtag,
      localSearchVolume: Math.floor(Math.random() * 1000) + 10
    },
    recommendations: {
      shouldUse: Math.random() > 0.3,
      frequency: ['daily', 'weekly', 'monthly'][Math.floor(Math.random() * 3)],
      bestTimeToPost: generateBestPostTimes(),
      notes: `Good hashtag for ${keyword} related content`
    }
  }));
}

function generateRelatedHashtags(baseHashtag) {
  const related = [
    `${baseHashtag}daily`,
    `${baseHashtag}lover`,
    `${baseHashtag}gram`,
    `local${baseHashtag}`,
    `best${baseHashtag}`
  ];
  return related.slice(0, Math.floor(Math.random() * 3) + 2);
}

function categorizeHashtag(hashtag) {
  if (hashtag.includes('coffee') || hashtag.includes('espresso') || hashtag.includes('latte')) {
    return 'coffee';
  } else if (hashtag.includes('cafe') || hashtag.includes('coffeeshop')) {
    return 'cafe';
  } else if (hashtag.includes('local') || hashtag.includes('community')) {
    return 'local';
  } else if (hashtag.includes('business') || hashtag.includes('small')) {
    return 'business';
  }
  return 'food';
}

function generateBestPostTimes() {
  const times = ['7:00 AM', '9:00 AM', '11:00 AM', '1:00 PM', '3:00 PM', '5:00 PM', '7:00 PM'];
  const count = Math.floor(Math.random() * 3) + 2;
  return times.sort(() => 0.5 - Math.random()).slice(0, count);
}

function generateHashtagSets(hashtags) {
  if (hashtags.length === 0) return [];

  const sets = [];
  const setTypes = ['trending', 'balanced', 'niche', 'local'];

  for (const type of setTypes) {
    let selectedHashtags = [];
    
    switch (type) {
      case 'trending':
        selectedHashtags = hashtags
          .filter(h => h.trending.isCurrentlyTrending)
          .slice(0, 10);
        break;
      case 'balanced':
        selectedHashtags = hashtags
          .filter(h => h.metrics.competition < 70 && h.metrics.popularity > 30)
          .slice(0, 15);
        break;
      case 'niche':
        selectedHashtags = hashtags
          .filter(h => h.metrics.competition < 40)
          .slice(0, 12);
        break;
      case 'local':
        selectedHashtags = hashtags
          .filter(h => h.category === 'local' || h.hashtag.includes('local'))
          .slice(0, 8);
        break;
    }

    if (selectedHashtags.length > 0) {
      sets.push({
        name: type.charAt(0).toUpperCase() + type.slice(1),
        type,
        hashtags: selectedHashtags.map(h => h.hashtag),
        description: getSetDescription(type),
        estimatedReach: calculateEstimatedReach(selectedHashtags)
      });
    }
  }

  return sets;
}

function getSetDescription(type) {
  const descriptions = {
    trending: 'Current trending hashtags for maximum visibility',
    balanced: 'Well-balanced mix of popular and achievable hashtags',
    niche: 'Low competition hashtags for targeted engagement',
    local: 'Location-based hashtags for local community reach'
  };
  return descriptions[type];
}

function calculateEstimatedReach(hashtags) {
  if (hashtags.length === 0) return 0;
  const avgPopularity = hashtags.reduce((sum, h) => sum + h.metrics.popularity, 0) / hashtags.length;
  return Math.floor(avgPopularity * hashtags.length * 100);
}

async function generateTrendingHashtags(platform) {
  // Mock trending hashtags - in production would use real API data
  const trending = [
    { hashtag: '#coffeetime', growth: '+45%', posts: 2300000 },
    { hashtag: '#mondaymotivation', growth: '+23%', posts: 1800000 },
    { hashtag: '#artisancoffee', growth: '+67%', posts: 890000 },
    { hashtag: '#localbusiness', growth: '+34%', posts: 1200000 },
    { hashtag: '#coffeeculture', growth: '+56%', posts: 650000 },
    { hashtag: '#smallbusiness', growth: '+28%', posts: 3400000 },
    { hashtag: '#supportlocal', growth: '+78%', posts: 980000 },
    { hashtag: '#freshbrew', growth: '+45%', posts: 340000 },
    { hashtag: '#cafevibes', growth: '+89%', posts: 450000 },
    { hashtag: '#coffeeaddict', growth: '+23%', posts: 1900000 }
  ];

  return trending.map(item => ({
    ...item,
    platform,
    difficulty: Math.random() > 0.5 ? 'medium' : 'hard',
    recommendation: Math.random() > 0.3 ? 'recommended' : 'consider'
  }));
}

module.exports = router;