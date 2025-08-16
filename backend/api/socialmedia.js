const express = require('express');
const SocialPost = require('../models/socialpost');
const Cafe = require('../models/cafe');
const HashtagResearch = require('../models/HashtagResearch');
const MarketingCampaign = require('../models/MarketingCampaign');
const { auth } = require('../utils/authmiddleware');
const axios = require('axios');

const router = express.Router();

// Get all posts for current cafe
router.get('/posts', auth, async (req, res) => {
  try {
    const cafe = await Cafe.findOne({ user: req.user.id });
    if (!cafe) {
      return res.status(404).json({ msg: 'Cafe profile not found' });
    }

    const posts = await SocialPost.find({ cafe: cafe._id }).sort({ scheduledDate: 1 });
    res.json(posts);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

// Generate AI content for a post
router.post('/generate-content', auth, async (req, res) => {
  const { postId, topic, platform } = req.body;

  try {
    const cafe = await Cafe.findOne({ user: req.user.id });
    if (!cafe) {
      return res.status(404).json({ msg: 'Cafe profile not found' });
    }

    let post;
    if (postId) {
      post = await SocialPost.findOne({ _id: postId, cafe: cafe._id });
      if (!post) {
        return res.status(404).json({ msg: 'Post not found' });
      }
    } else {
      post = new SocialPost({
        cafe: cafe._id,
        platform: platform || 'instagram',
        status: 'pending'
      });
    }

    // Mock AI content generation (in a real app, this would call an AI API)
    const aiContent = await generateAIContent(cafe.name, topic);
    
    post.content = aiContent.text;
    post.imageUrl = aiContent.imageUrl;
    post.status = 'ready';
    
    await post.save();
    res.json(post);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

// Schedule a post
router.post('/schedule', auth, async (req, res) => {
  const { postId, scheduledDate } = req.body;

  try {
    const cafe = await Cafe.findOne({ user: req.user.id });
    if (!cafe) {
      return res.status(404).json({ msg: 'Cafe profile not found' });
    }

    const post = await SocialPost.findOne({ _id: postId, cafe: cafe._id });
    if (!post) {
      return res.status(404).json({ msg: 'Post not found' });
    }

    post.scheduledDate = new Date(scheduledDate);
    post.status = 'scheduled';
    
    await post.save();
    res.json(post);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

// Enhanced AI content generation with hashtag research integration
router.post('/generate-advanced-content', auth, async (req, res) => {
  const { topic, platform, tone, includeHashtags, campaignId, targetAudience } = req.body;

  try {
    const cafe = await Cafe.findOne({ user: req.user.id });
    if (!cafe) {
      return res.status(404).json({ msg: 'Cafe profile not found' });
    }

    // Get relevant hashtags for the cafe
    const hashtags = await HashtagResearch.find({ 
      cafe: cafe._id, 
      platform: platform || 'instagram',
      'recommendations.shouldUse': true 
    }).limit(10);

    // Get campaign context if provided
    let campaign = null;
    if (campaignId) {
      campaign = await MarketingCampaign.findOne({ 
        _id: campaignId, 
        cafe: cafe._id 
      });
    }

    // Generate advanced AI content
    const aiContent = await generateAdvancedAIContent(
      cafe.name, 
      topic, 
      platform, 
      tone, 
      hashtags, 
      campaign,
      targetAudience
    );

    // Create new social post
    const post = new SocialPost({
      cafe: cafe._id,
      platform: platform || 'instagram',
      content: aiContent.text,
      imageUrl: aiContent.imageUrl,
      status: 'ready',
      contentType: aiContent.contentType,
      metadata: {
        hashtags: aiContent.hashtags,
        tone,
        topic,
        generatedAt: new Date(),
        aiPrompt: aiContent.prompt
      }
    });

    await post.save();

    res.json({
      post,
      aiContent,
      suggestions: aiContent.suggestions
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

// Bulk schedule posts with AI automation
router.post('/bulk-schedule', auth, async (req, res) => {
  const { startDate, endDate, frequency, platforms, topics, timezone = 'UTC' } = req.body;

  try {
    const cafe = await Cafe.findOne({ user: req.user.id });
    if (!cafe) {
      return res.status(404).json({ msg: 'Cafe profile not found' });
    }

    const scheduledPosts = await generateBulkSchedule(
      cafe,
      startDate,
      endDate,
      frequency,
      platforms,
      topics,
      timezone
    );

    res.json({
      msg: `Scheduled ${scheduledPosts.length} posts`,
      posts: scheduledPosts,
      schedule: {
        startDate,
        endDate,
        frequency,
        platforms,
        totalPosts: scheduledPosts.length
      }
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

// Analytics for social media posts
router.get('/analytics', auth, async (req, res) => {
  try {
    const cafe = await Cafe.findOne({ user: req.user.id });
    if (!cafe) {
      return res.status(404).json({ msg: 'Cafe profile not found' });
    }

    const { period = '30' } = req.query;
    const daysAgo = parseInt(period);
    const dateFilter = new Date();
    dateFilter.setDate(dateFilter.getDate() - daysAgo);

    const posts = await SocialPost.find({
      cafe: cafe._id,
      createdAt: { $gte: dateFilter }
    });

    const analytics = calculateSocialMediaAnalytics(posts);

    res.json(analytics);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

// Zapier webhook integration
router.post('/zapier/webhook', async (req, res) => {
  try {
    const { event, cafeId, data } = req.body;

    // Verify webhook authenticity (in production, use proper verification)
    if (!event || !cafeId) {
      return res.status(400).json({ msg: 'Invalid webhook data' });
    }

    const cafe = await Cafe.findById(cafeId);
    if (!cafe) {
      return res.status(404).json({ msg: 'Cafe not found' });
    }

    let result = {};

    switch (event) {
      case 'schedule_post':
        result = await handleZapierSchedulePost(cafe, data);
        break;
      case 'generate_content':
        result = await handleZapierGenerateContent(cafe, data);
        break;
      case 'post_engagement':
        result = await handleZapierPostEngagement(cafe, data);
        break;
      default:
        return res.status(400).json({ msg: 'Unknown event type' });
    }

    res.json({ success: true, result });
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

// Mock function to generate AI content
async function generateAIContent(cafeName, topic) {
  // In a real app, this would call an AI API like OpenAI
  
  const topics = {
    default: `Visit ${cafeName} today for the best coffee experience!`,
    special: `Weekend special at ${cafeName}! Buy one get one free on all pastries.`,
    coffee: `Introducing our new signature blend at ${cafeName}. A perfect balance of flavor and aroma.`,
    event: `Join us this Friday at ${cafeName} for live music and specialty drinks!`
  };
  
  const content = topics[topic] || topics.default;
  
  // Mock image URL (in a real app, this would be generated by an AI service)
  const imageUrl = `https://source.unsplash.com/random/1080x1080/?cafe,coffee`;
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  return {
    text: content,
    imageUrl
  };
}

// Enhanced AI content generation function
async function generateAdvancedAIContent(cafeName, topic, platform, tone, hashtags, campaign, targetAudience) {
  // Enhanced content templates based on tone and topic
  const toneTemplates = {
    friendly: {
      default: `Hey coffee lovers! ☕ Start your day right with a visit to ${cafeName}. We're brewing something special just for you!`,
      special: `🎉 Amazing news! This week only at ${cafeName} - special offers that'll make your coffee experience even better!`,
      coffee: `Coffee lovers, meet your new favorite! ☕ Our latest blend at ${cafeName} is crafted with love and precision.`,
      event: `🎵 Mark your calendars! Join us this weekend at ${cafeName} for an evening of great music and exceptional coffee!`
    },
    professional: {
      default: `Experience premium coffee craftsmanship at ${cafeName}. Quality ingredients, expert preparation, exceptional taste.`,
      special: `Limited time offer at ${cafeName}. Discover our featured selections and seasonal specialties.`,
      coffee: `Introducing our signature coffee blend at ${cafeName}. Meticulously sourced and expertly roasted for the perfect cup.`,
      event: `${cafeName} presents an exclusive coffee tasting event. Join fellow coffee enthusiasts for an educational experience.`
    },
    casual: {
      default: `Coffee time at ${cafeName}! Drop by for your daily dose of caffeine and good vibes ☕✨`,
      special: `Weekend vibes at ${cafeName}! Special treats and coffee combos that'll make your day 🌟`,
      coffee: `New coffee alert! 🚨 We've got a fresh blend that's absolutely incredible at ${cafeName}`,
      event: `Party time at ${cafeName}! Music, coffee, and good company - what more could you want? 🎉`
    },
    engaging: {
      default: `What's your perfect coffee moment? ☕ Share it with us at ${cafeName} where every cup tells a story!`,
      special: `Coffee lovers, we've got a surprise! 🎁 This week's special at ${cafeName} is designed just for you!`,
      coffee: `Ready for a coffee adventure? 🌟 Our new blend at ${cafeName} is here to take your taste buds on a journey!`,
      event: `Who's ready for an unforgettable evening? 🎵 Join us at ${cafeName} for music, coffee, and memories!`
    }
  };

  const selectedTone = tone || 'friendly';
  const templates = toneTemplates[selectedTone] || toneTemplates.friendly;
  let content = templates[topic] || templates.default;

  // Add campaign-specific content if available
  if (campaign && campaign.content.contentTemplates.length > 0) {
    const campaignTemplate = campaign.content.contentTemplates[0];
    content += `\n\n${campaignTemplate}`;
  }

  // Add target audience specific messaging
  if (targetAudience) {
    const audienceMessages = {
      'young-professionals': '\n\nPerfect for your busy lifestyle! ⚡',
      'students': '\n\nGreat study spot with student-friendly prices! 📚',
      'families': '\n\nFamily-friendly atmosphere with something for everyone! 👨‍👩‍👧‍👦',
      'remote-workers': '\n\nFree WiFi and quiet spaces for productive work! 💻'
    };
    
    if (audienceMessages[targetAudience]) {
      content += audienceMessages[targetAudience];
    }
  }

  // Add relevant hashtags
  let selectedHashtags = [];
  if (hashtags && hashtags.length > 0) {
    // Select top hashtags based on engagement and popularity
    selectedHashtags = hashtags
      .sort((a, b) => (b.metrics.engagement + b.metrics.popularity) - (a.metrics.engagement + a.metrics.popularity))
      .slice(0, platform === 'twitter' ? 3 : 8)
      .map(h => h.hashtag);
  } else {
    // Default hashtags if no research available
    const defaultHashtags = ['#coffee', '#cafe', '#local', '#fresh', '#quality'];
    selectedHashtags = defaultHashtags.slice(0, platform === 'twitter' ? 3 : 5);
  }

  // Platform-specific content optimization
  if (platform === 'twitter') {
    content = content.substring(0, 240); // Twitter character limit
  } else if (platform === 'instagram') {
    content += '\n\n' + selectedHashtags.join(' ');
  }

  // Generate appropriate image URL based on topic
  const imageThemes = {
    default: 'cafe,coffee,warm',
    special: 'cafe,special,promotion',
    coffee: 'coffee,beans,brewing',
    event: 'cafe,music,event,people'
  };
  
  const theme = imageThemes[topic] || imageThemes.default;
  const imageUrl = `https://source.unsplash.com/1080x1080/?${theme}`;

  // Content type suggestions
  const contentType = platform === 'instagram' && Math.random() > 0.7 ? 'carousel' : 'image';

  // Generate engagement predictions
  const engagementPrediction = {
    likes: Math.floor(Math.random() * 200) + 50,
    comments: Math.floor(Math.random() * 30) + 5,
    shares: Math.floor(Math.random() * 15) + 2,
    bestTimeToPost: getBestPostingTime(platform)
  };

  return {
    text: content,
    hashtags: selectedHashtags,
    imageUrl,
    contentType,
    prompt: `Generate ${tone} ${topic} content for ${platform}`,
    engagementPrediction,
    suggestions: [
      'Consider posting during peak engagement hours',
      'Add a call-to-action to increase interaction',
      'Use location tags for local discovery',
      'Respond to comments within 2 hours for better engagement'
    ]
  };
}

// Generate bulk posting schedule
async function generateBulkSchedule(cafe, startDate, endDate, frequency, platforms, topics, timezone) {
  const posts = [];
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  // Calculate posting times based on frequency
  const postingTimes = generatePostingTimes(frequency, platforms);
  
  let currentDate = new Date(start);
  
  while (currentDate <= end) {
    for (const platform of platforms) {
      for (const time of postingTimes[platform] || ['09:00']) {
        const topic = topics[Math.floor(Math.random() * topics.length)];
        
        // Generate content for this post
        const aiContent = await generateAdvancedAIContent(
          cafe.name,
          topic,
          platform,
          'friendly',
          [],
          null,
          null
        );
        
        // Create scheduled post
        const scheduledDate = new Date(currentDate);
        const [hours, minutes] = time.split(':');
        scheduledDate.setHours(parseInt(hours), parseInt(minutes), 0);
        
        const post = new SocialPost({
          cafe: cafe._id,
          platform,
          content: aiContent.text,
          imageUrl: aiContent.imageUrl,
          scheduledDate,
          status: 'scheduled',
          contentType: aiContent.contentType,
          metadata: {
            hashtags: aiContent.hashtags,
            topic,
            generatedAt: new Date(),
            bulkScheduled: true
          }
        });
        
        await post.save();
        posts.push(post);
      }
    }
    
    // Move to next day based on frequency
    if (frequency === 'daily') {
      currentDate.setDate(currentDate.getDate() + 1);
    } else if (frequency === 'weekly') {
      currentDate.setDate(currentDate.getDate() + 7);
    }
  }
  
  return posts;
}

function generatePostingTimes(frequency, platforms) {
  const optimalTimes = {
    instagram: ['09:00', '13:00', '17:00'],
    facebook: ['13:00', '15:00', '16:00'],
    twitter: ['09:00', '12:00', '18:00']
  };
  
  const result = {};
  
  for (const platform of platforms) {
    if (frequency === 'daily') {
      result[platform] = [optimalTimes[platform][0]]; // One post per day
    } else if (frequency === 'multiple_daily') {
      result[platform] = optimalTimes[platform]; // Multiple posts per day
    } else {
      result[platform] = [optimalTimes[platform][1]]; // Default to afternoon
    }
  }
  
  return result;
}

function getBestPostingTime(platform) {
  const times = {
    instagram: ['9:00 AM', '1:00 PM', '5:00 PM'],
    facebook: ['1:00 PM', '3:00 PM', '4:00 PM'],
    twitter: ['9:00 AM', '12:00 PM', '6:00 PM']
  };
  
  const platformTimes = times[platform] || times.instagram;
  return platformTimes[Math.floor(Math.random() * platformTimes.length)];
}

function calculateSocialMediaAnalytics(posts) {
  const totalPosts = posts.length;
  const platformBreakdown = {};
  const statusBreakdown = {};
  const engagementMetrics = {
    totalLikes: 0,
    totalComments: 0,
    totalShares: 0,
    averageEngagement: 0
  };
  
  posts.forEach(post => {
    // Platform breakdown
    platformBreakdown[post.platform] = (platformBreakdown[post.platform] || 0) + 1;
    
    // Status breakdown
    statusBreakdown[post.status] = (statusBreakdown[post.status] || 0) + 1;
    
    // Mock engagement metrics (in production, these would come from social media APIs)
    const mockEngagement = {
      likes: Math.floor(Math.random() * 100) + 10,
      comments: Math.floor(Math.random() * 20) + 2,
      shares: Math.floor(Math.random() * 10) + 1
    };
    
    engagementMetrics.totalLikes += mockEngagement.likes;
    engagementMetrics.totalComments += mockEngagement.comments;
    engagementMetrics.totalShares += mockEngagement.shares;
  });
  
  engagementMetrics.averageEngagement = totalPosts > 0 
    ? ((engagementMetrics.totalLikes + engagementMetrics.totalComments + engagementMetrics.totalShares) / totalPosts).toFixed(2)
    : 0;
  
  return {
    overview: {
      totalPosts,
      platformBreakdown,
      statusBreakdown
    },
    engagement: engagementMetrics,
    trends: generateTrendAnalysis(posts),
    recommendations: generateRecommendations(posts, engagementMetrics)
  };
}

function generateTrendAnalysis(posts) {
  const last7Days = posts.filter(post => {
    const postDate = new Date(post.createdAt);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return postDate >= weekAgo;
  });
  
  const last30Days = posts.filter(post => {
    const postDate = new Date(post.createdAt);
    const monthAgo = new Date();
    monthAgo.setDate(monthAgo.getDate() - 30);
    return postDate >= monthAgo;
  });
  
  return {
    weeklyGrowth: ((last7Days.length / Math.max(posts.length - last7Days.length, 1)) * 100).toFixed(2) + '%',
    monthlyTotal: last30Days.length,
    mostActiveDay: getMostActiveDay(posts),
    topPerformingPlatform: getTopPerformingPlatform(posts)
  };
}

function generateRecommendations(posts, engagementMetrics) {
  const recommendations = [];
  
  if (engagementMetrics.averageEngagement < 20) {
    recommendations.push('Consider improving content quality and using more engaging visuals');
  }
  
  if (posts.filter(p => p.status === 'failed').length > 0) {
    recommendations.push('Review failed posts and ensure proper scheduling');
  }
  
  const instagramPosts = posts.filter(p => p.platform === 'instagram').length;
  const facebookPosts = posts.filter(p => p.platform === 'facebook').length;
  
  if (instagramPosts === 0) {
    recommendations.push('Consider adding Instagram to your social media strategy');
  }
  
  if (facebookPosts === 0) {
    recommendations.push('Facebook can help reach a different audience demographic');
  }
  
  recommendations.push('Post consistently during peak engagement hours');
  recommendations.push('Use relevant hashtags to increase discoverability');
  
  return recommendations;
}

function getMostActiveDay(posts) {
  const dayCount = {};
  posts.forEach(post => {
    const day = new Date(post.createdAt).toLocaleDateString('en-US', { weekday: 'long' });
    dayCount[day] = (dayCount[day] || 0) + 1;
  });
  
  return Object.keys(dayCount).reduce((a, b) => dayCount[a] > dayCount[b] ? a : b, 'Monday');
}

function getTopPerformingPlatform(posts) {
  const platformCount = {};
  posts.forEach(post => {
    platformCount[post.platform] = (platformCount[post.platform] || 0) + 1;
  });
  
  return Object.keys(platformCount).reduce((a, b) => platformCount[a] > platformCount[b] ? a : b, 'instagram');
}

// Zapier webhook handlers
async function handleZapierSchedulePost(cafe, data) {
  const { platform, content, scheduledDate, imageUrl } = data;
  
  const post = new SocialPost({
    cafe: cafe._id,
    platform,
    content,
    imageUrl,
    scheduledDate: new Date(scheduledDate),
    status: 'scheduled',
    metadata: {
      zapierTriggered: true,
      triggeredAt: new Date()
    }
  });
  
  await post.save();
  return { postId: post._id, message: 'Post scheduled successfully' };
}

async function handleZapierGenerateContent(cafe, data) {
  const { topic, platform, tone } = data;
  
  const aiContent = await generateAdvancedAIContent(
    cafe.name,
    topic,
    platform,
    tone,
    [],
    null,
    null
  );
  
  return {
    content: aiContent.text,
    hashtags: aiContent.hashtags,
    imageUrl: aiContent.imageUrl,
    suggestions: aiContent.suggestions
  };
}

async function handleZapierPostEngagement(cafe, data) {
  const { postId, likes, comments, shares } = data;
  
  // In production, this would update the post's engagement metrics
  // For now, we'll just acknowledge the webhook
  
  return {
    message: 'Engagement data received',
    postId,
    metrics: { likes, comments, shares }
  };
}

module.exports = router;