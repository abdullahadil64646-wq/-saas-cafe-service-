const express = require('express');
const MarketingCampaign = require('../models/MarketingCampaign');
const Cafe = require('../models/Cafe');
const { auth } = require('../utils/authMiddleware');
const axios = require('axios');

const router = express.Router();

// Get all campaigns for current cafe
router.get('/', auth, async (req, res) => {
  try {
    const cafe = await Cafe.findOne({ user: req.user.id });
    if (!cafe) {
      return res.status(404).json({ msg: 'Cafe profile not found' });
    }

    const campaigns = await MarketingCampaign.find({ cafe: cafe._id })
      .sort({ createdAt: -1 });

    res.json(campaigns);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

// Get campaign by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const cafe = await Cafe.findOne({ user: req.user.id });
    if (!cafe) {
      return res.status(404).json({ msg: 'Cafe profile not found' });
    }

    const campaign = await MarketingCampaign.findOne({ 
      _id: req.params.id,
      cafe: cafe._id 
    });

    if (!campaign) {
      return res.status(404).json({ msg: 'Campaign not found' });
    }

    res.json(campaign);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

// Create new campaign
router.post('/', auth, async (req, res) => {
  try {
    const cafe = await Cafe.findOne({ user: req.user.id });
    if (!cafe) {
      return res.status(404).json({ msg: 'Cafe profile not found' });
    }

    const campaignData = {
      ...req.body,
      cafe: cafe._id
    };

    const newCampaign = new MarketingCampaign(campaignData);
    const campaign = await newCampaign.save();

    res.json(campaign);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

// Update campaign
router.put('/:id', auth, async (req, res) => {
  try {
    const cafe = await Cafe.findOne({ user: req.user.id });
    if (!cafe) {
      return res.status(404).json({ msg: 'Cafe profile not found' });
    }

    const campaign = await MarketingCampaign.findOneAndUpdate(
      { _id: req.params.id, cafe: cafe._id },
      { ...req.body, updatedAt: Date.now() },
      { new: true }
    );

    if (!campaign) {
      return res.status(404).json({ msg: 'Campaign not found' });
    }

    res.json(campaign);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

// Delete campaign
router.delete('/:id', auth, async (req, res) => {
  try {
    const cafe = await Cafe.findOne({ user: req.user.id });
    if (!cafe) {
      return res.status(404).json({ msg: 'Cafe profile not found' });
    }

    const campaign = await MarketingCampaign.findOneAndDelete({
      _id: req.params.id,
      cafe: cafe._id
    });

    if (!campaign) {
      return res.status(404).json({ msg: 'Campaign not found' });
    }

    res.json({ msg: 'Campaign deleted successfully' });
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

// Start/activate campaign
router.post('/:id/start', auth, async (req, res) => {
  try {
    const cafe = await Cafe.findOne({ user: req.user.id });
    if (!cafe) {
      return res.status(404).json({ msg: 'Cafe profile not found' });
    }

    const campaign = await MarketingCampaign.findOneAndUpdate(
      { _id: req.params.id, cafe: cafe._id },
      { 
        status: 'active',
        'schedule.startDate': new Date(),
        updatedAt: Date.now()
      },
      { new: true }
    );

    if (!campaign) {
      return res.status(404).json({ msg: 'Campaign not found' });
    }

    // If Zapier webhook is configured, trigger it
    if (campaign.automation.zapierWebhookUrl) {
      try {
        await axios.post(campaign.automation.zapierWebhookUrl, {
          event: 'campaign_started',
          campaignId: campaign._id,
          cafeName: cafe.name,
          campaignData: campaign
        });
      } catch (webhookError) {
        console.error('Zapier webhook error:', webhookError.message);
      }
    }

    res.json(campaign);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

// Pause campaign
router.post('/:id/pause', auth, async (req, res) => {
  try {
    const cafe = await Cafe.findOne({ user: req.user.id });
    if (!cafe) {
      return res.status(404).json({ msg: 'Cafe profile not found' });
    }

    const campaign = await MarketingCampaign.findOneAndUpdate(
      { _id: req.params.id, cafe: cafe._id },
      { 
        status: 'paused',
        updatedAt: Date.now()
      },
      { new: true }
    );

    if (!campaign) {
      return res.status(404).json({ msg: 'Campaign not found' });
    }

    res.json(campaign);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

// Update campaign metrics
router.post('/:id/metrics', auth, async (req, res) => {
  try {
    const cafe = await Cafe.findOne({ user: req.user.id });
    if (!cafe) {
      return res.status(404).json({ msg: 'Cafe profile not found' });
    }

    const { impressions, clicks, engagements, conversions, spend } = req.body;

    const campaign = await MarketingCampaign.findOneAndUpdate(
      { _id: req.params.id, cafe: cafe._id },
      { 
        $inc: {
          'metrics.impressions': impressions || 0,
          'metrics.clicks': clicks || 0,
          'metrics.engagements': engagements || 0,
          'metrics.conversions': conversions || 0,
          'metrics.spend': spend || 0
        },
        updatedAt: Date.now()
      },
      { new: true }
    );

    if (!campaign) {
      return res.status(404).json({ msg: 'Campaign not found' });
    }

    res.json(campaign);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

// Generate campaign content using AI
router.post('/:id/generate-content', auth, async (req, res) => {
  try {
    const cafe = await Cafe.findOne({ user: req.user.id });
    if (!cafe) {
      return res.status(404).json({ msg: 'Cafe profile not found' });
    }

    const campaign = await MarketingCampaign.findOne({ 
      _id: req.params.id,
      cafe: cafe._id 
    });

    if (!campaign) {
      return res.status(404).json({ msg: 'Campaign not found' });
    }

    const { contentType, platform, theme } = req.body;

    // Mock AI content generation
    const generatedContent = await generateCampaignContent(
      cafe.name, 
      campaign, 
      contentType, 
      platform, 
      theme
    );

    res.json(generatedContent);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

// Mock function to generate campaign content
async function generateCampaignContent(cafeName, campaign, contentType, platform, theme) {
  const themes = {
    morning: `Start your morning right at ${cafeName}! ☕ Fresh coffee and pastries await you.`,
    lunch: `Lunch break calls for good coffee! Visit ${cafeName} for our lunch specials.`,
    evening: `Wind down your evening at ${cafeName} with our cozy atmosphere and premium coffee.`,
    weekend: `Weekend vibes at ${cafeName}! Perfect spot for brunch and great coffee.`,
    special: `Special announcement from ${cafeName}! Don't miss out on our latest offerings.`,
    seasonal: `Seasonal favorites now available at ${cafeName}! Limited time only.`
  };

  const hashtags = campaign.content.hashtags.length > 0 
    ? campaign.content.hashtags.join(' ')
    : '#coffee #cafe #local #fresh #quality';

  const content = themes[theme] || themes.special;
  
  // Platform-specific adaptations
  let adaptedContent = content;
  if (platform === 'twitter') {
    adaptedContent = content.substring(0, 240); // Twitter character limit
  } else if (platform === 'instagram') {
    adaptedContent += `\n\n${hashtags}`;
  }

  // Mock image URL based on theme
  const imageUrl = `https://source.unsplash.com/1080x1080/?cafe,coffee,${theme}`;

  return {
    text: adaptedContent,
    hashtags: campaign.content.hashtags,
    imageUrl,
    platform,
    theme,
    suggestedPostTime: getBestPostTime(platform),
    engagement: {
      predictedLikes: Math.floor(Math.random() * 100) + 20,
      predictedComments: Math.floor(Math.random() * 20) + 5,
      predictedShares: Math.floor(Math.random() * 10) + 2
    }
  };
}

function getBestPostTime(platform) {
  const times = {
    instagram: ['9:00 AM', '1:00 PM', '5:00 PM'],
    facebook: ['1:00 PM', '3:00 PM', '4:00 PM'],
    twitter: ['9:00 AM', '12:00 PM', '6:00 PM']
  };

  const platformTimes = times[platform] || times.instagram;
  return platformTimes[Math.floor(Math.random() * platformTimes.length)];
}

module.exports = router;