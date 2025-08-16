const express = require('express');
const Analytics = require('../models/Analytics');
const Cafe = require('../models/cafe');
const SocialPost = require('../models/socialpost');
const MarketingCampaign = require('../models/MarketingCampaign');
const { auth } = require('../utils/authmiddleware');

const router = express.Router();

// Get analytics dashboard data
router.get('/dashboard', auth, async (req, res) => {
  try {
    const cafe = await Cafe.findOne({ user: req.user.id });
    if (!cafe) {
      return res.status(404).json({ msg: 'Cafe profile not found' });
    }

    const { period = '30' } = req.query;
    const daysAgo = parseInt(period);
    const dateFilter = new Date();
    dateFilter.setDate(dateFilter.getDate() - daysAgo);

    // Get latest analytics data
    const analytics = await Analytics.findOne({
      cafe: cafe._id,
      period: 'daily'
    }).sort({ date: -1 });

    // Get social media metrics
    const socialPosts = await SocialPost.find({
      cafe: cafe._id,
      createdAt: { $gte: dateFilter }
    });

    // Get campaign performance
    const campaigns = await MarketingCampaign.find({
      cafe: cafe._id,
      createdAt: { $gte: dateFilter }
    });

    const dashboardData = {
      overview: {
        totalPosts: socialPosts.length,
        activeCampaigns: campaigns.filter(c => c.status === 'active').length,
        totalCampaigns: campaigns.length,
        period: `${period} days`
      },
      socialMedia: calculateSocialMediaMetrics(socialPosts),
      campaigns: calculateCampaignMetrics(campaigns),
      analytics: analytics || {},
      trends: await calculateTrends(cafe._id, daysAgo),
      recommendations: generateDashboardRecommendations(socialPosts, campaigns, analytics)
    };

    res.json(dashboardData);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

// Get detailed analytics for a specific period
router.get('/detailed', auth, async (req, res) => {
  try {
    const cafe = await Cafe.findOne({ user: req.user.id });
    if (!cafe) {
      return res.status(404).json({ msg: 'Cafe profile not found' });
    }

    const { startDate, endDate, metric } = req.query;
    
    if (!startDate || !endDate) {
      return res.status(400).json({ msg: 'Start date and end date are required' });
    }

    const analytics = await Analytics.find({
      cafe: cafe._id,
      date: {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      }
    }).sort({ date: 1 });

    const detailedData = {
      period: { startDate, endDate },
      data: analytics,
      summary: calculateDetailedSummary(analytics, metric),
      charts: generateChartData(analytics, metric)
    };

    res.json(detailedData);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

// Create or update analytics data
router.post('/update', auth, async (req, res) => {
  try {
    const cafe = await Cafe.findOne({ user: req.user.id });
    if (!cafe) {
      return res.status(404).json({ msg: 'Cafe profile not found' });
    }

    const { date, period, data } = req.body;

    if (!date || !period || !data) {
      return res.status(400).json({ msg: 'Date, period, and data are required' });
    }

    // Check if analytics entry already exists
    let analytics = await Analytics.findOne({
      cafe: cafe._id,
      date: new Date(date),
      period
    });

    if (analytics) {
      // Update existing analytics
      Object.assign(analytics, data);
      await analytics.save();
    } else {
      // Create new analytics entry
      analytics = new Analytics({
        cafe: cafe._id,
        date: new Date(date),
        period,
        ...data
      });
      await analytics.save();
    }

    res.json(analytics);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

// Get social media analytics
router.get('/social-media', auth, async (req, res) => {
  try {
    const cafe = await Cafe.findOne({ user: req.user.id });
    if (!cafe) {
      return res.status(404).json({ msg: 'Cafe profile not found' });
    }

    const { period = '30', platform } = req.query;
    const daysAgo = parseInt(period);
    const dateFilter = new Date();
    dateFilter.setDate(dateFilter.getDate() - daysAgo);

    const filter = {
      cafe: cafe._id,
      date: { $gte: dateFilter }
    };

    const analytics = await Analytics.find(filter).sort({ date: -1 });

    const socialMediaData = {
      overview: aggregateSocialMediaData(analytics, platform),
      platformComparison: comparePlatformPerformance(analytics),
      engagementTrends: calculateEngagementTrends(analytics),
      topPerformingPosts: await getTopPerformingPosts(cafe._id, platform, daysAgo),
      audienceInsights: generateAudienceInsights(analytics)
    };

    res.json(socialMediaData);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

// Get campaign analytics
router.get('/campaigns/:campaignId', auth, async (req, res) => {
  try {
    const cafe = await Cafe.findOne({ user: req.user.id });
    if (!cafe) {
      return res.status(404).json({ msg: 'Cafe profile not found' });
    }

    const campaign = await MarketingCampaign.findOne({
      _id: req.params.campaignId,
      cafe: cafe._id
    });

    if (!campaign) {
      return res.status(404).json({ msg: 'Campaign not found' });
    }

    // Get analytics data for this campaign
    const analytics = await Analytics.find({
      cafe: cafe._id,
      'campaigns.campaignId': campaign._id
    }).sort({ date: -1 });

    const campaignAnalytics = {
      campaign,
      performance: calculateCampaignPerformance(campaign, analytics),
      timeline: generateCampaignTimeline(campaign, analytics),
      roi: calculateROI(campaign),
      recommendations: generateCampaignRecommendations(campaign, analytics)
    };

    res.json(campaignAnalytics);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

// Generate analytics report
router.post('/report', auth, async (req, res) => {
  try {
    const cafe = await Cafe.findOne({ user: req.user.id });
    if (!cafe) {
      return res.status(404).json({ msg: 'Cafe profile not found' });
    }

    const { startDate, endDate, reportType, includePlatforms, includeMetrics } = req.body;

    const analytics = await Analytics.find({
      cafe: cafe._id,
      date: {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      }
    }).sort({ date: 1 });

    const report = await generateAnalyticsReport(
      cafe,
      analytics,
      reportType,
      includePlatforms,
      includeMetrics,
      { startDate, endDate }
    );

    res.json(report);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

// Helper Functions

function calculateSocialMediaMetrics(posts) {
  const platforms = {};
  posts.forEach(post => {
    if (!platforms[post.platform]) {
      platforms[post.platform] = {
        posts: 0,
        scheduled: 0,
        published: 0,
        failed: 0
      };
    }
    
    platforms[post.platform].posts++;
    platforms[post.platform][post.status]++;
  });

  return {
    totalPosts: posts.length,
    platforms,
    successRate: posts.length > 0 ? ((posts.filter(p => p.status === 'posted').length / posts.length) * 100).toFixed(2) : 0
  };
}

function calculateCampaignMetrics(campaigns) {
  const metrics = {
    total: campaigns.length,
    active: campaigns.filter(c => c.status === 'active').length,
    paused: campaigns.filter(c => c.status === 'paused').length,
    completed: campaigns.filter(c => c.status === 'completed').length,
    totalSpend: campaigns.reduce((sum, c) => sum + (c.metrics.spend || 0), 0),
    totalConversions: campaigns.reduce((sum, c) => sum + (c.metrics.conversions || 0), 0),
    averageROAS: 0
  };

  // Calculate average ROAS
  if (metrics.totalSpend > 0) {
    const totalRevenue = metrics.totalConversions * 15; // Assume $15 average order value
    metrics.averageROAS = (totalRevenue / metrics.totalSpend).toFixed(2);
  }

  return metrics;
}

async function calculateTrends(cafeId, daysAgo) {
  const previousPeriodStart = new Date();
  previousPeriodStart.setDate(previousPeriodStart.getDate() - (daysAgo * 2));
  
  const previousPeriodEnd = new Date();
  previousPeriodEnd.setDate(previousPeriodEnd.getDate() - daysAgo);

  const currentPeriodStart = new Date();
  currentPeriodStart.setDate(currentPeriodStart.getDate() - daysAgo);

  // Get posts for both periods
  const currentPosts = await SocialPost.find({
    cafe: cafeId,
    createdAt: { $gte: currentPeriodStart }
  });

  const previousPosts = await SocialPost.find({
    cafe: cafeId,
    createdAt: { 
      $gte: previousPeriodStart,
      $lt: previousPeriodEnd
    }
  });

  const currentCount = currentPosts.length;
  const previousCount = previousPosts.length;
  
  const growth = previousCount > 0 
    ? (((currentCount - previousCount) / previousCount) * 100).toFixed(2)
    : currentCount > 0 ? 100 : 0;

  return {
    postsGrowth: `${growth}%`,
    currentPeriodPosts: currentCount,
    previousPeriodPosts: previousCount,
    trend: growth > 0 ? 'up' : growth < 0 ? 'down' : 'stable'
  };
}

function generateDashboardRecommendations(posts, campaigns, analytics) {
  const recommendations = [];

  // Post frequency recommendations
  if (posts.length < 7) {
    recommendations.push({
      type: 'content',
      priority: 'high',
      title: 'Increase Posting Frequency',
      description: 'Consider posting more regularly to maintain audience engagement'
    });
  }

  // Campaign recommendations
  if (campaigns.filter(c => c.status === 'active').length === 0) {
    recommendations.push({
      type: 'marketing',
      priority: 'medium',
      title: 'Start a Marketing Campaign',
      description: 'Launch a targeted campaign to boost your social media presence'
    });
  }

  // Platform diversification
  const platforms = [...new Set(posts.map(p => p.platform))];
  if (platforms.length < 2) {
    recommendations.push({
      type: 'strategy',
      priority: 'medium',
      title: 'Expand to More Platforms',
      description: 'Consider expanding to additional social media platforms'
    });
  }

  // Engagement optimization
  recommendations.push({
    type: 'engagement',
    priority: 'low',
    title: 'Optimize Posting Times',
    description: 'Post during peak engagement hours for better reach'
  });

  return recommendations;
}

function calculateDetailedSummary(analytics, metric) {
  if (!analytics.length) return {};

  const summary = {
    total: analytics.length,
    average: 0,
    growth: 0,
    peak: null,
    low: null
  };

  // Calculate based on metric type
  let values = [];
  
  switch (metric) {
    case 'followers':
      values = analytics.map(a => 
        (a.socialMedia?.instagram?.followers || 0) + 
        (a.socialMedia?.facebook?.followers || 0) + 
        (a.socialMedia?.twitter?.followers || 0)
      );
      break;
    case 'engagement':
      values = analytics.map(a => 
        (a.socialMedia?.instagram?.engagement?.rate || 0) + 
        (a.socialMedia?.facebook?.engagement?.rate || 0) + 
        (a.socialMedia?.twitter?.engagement?.rate || 0)
      );
      break;
    case 'revenue':
      values = analytics.map(a => a.business?.revenue || 0);
      break;
    default:
      values = analytics.map(() => Math.random() * 100);
  }

  if (values.length > 0) {
    summary.average = (values.reduce((sum, val) => sum + val, 0) / values.length).toFixed(2);
    summary.peak = Math.max(...values);
    summary.low = Math.min(...values);
    
    if (values.length > 1) {
      const firstHalf = values.slice(0, Math.floor(values.length / 2));
      const secondHalf = values.slice(Math.floor(values.length / 2));
      
      const firstAvg = firstHalf.reduce((sum, val) => sum + val, 0) / firstHalf.length;
      const secondAvg = secondHalf.reduce((sum, val) => sum + val, 0) / secondHalf.length;
      
      summary.growth = ((secondAvg - firstAvg) / firstAvg * 100).toFixed(2);
    }
  }

  return summary;
}

function generateChartData(analytics, metric) {
  return analytics.map((item, index) => ({
    date: item.date,
    value: Math.random() * 100 + index * 2, // Mock data
    label: item.date.toLocaleDateString()
  }));
}

function aggregateSocialMediaData(analytics, platform) {
  // Aggregate social media metrics
  const aggregated = {
    totalFollowers: 0,
    totalEngagement: 0,
    totalReach: 0,
    totalImpressions: 0,
    averageEngagementRate: 0
  };

  let count = 0;
  analytics.forEach(item => {
    if (platform) {
      const platformData = item.socialMedia?.[platform];
      if (platformData) {
        aggregated.totalFollowers += platformData.followers || 0;
        aggregated.totalEngagement += (platformData.engagement?.likes || 0) + 
                                     (platformData.engagement?.comments || 0) + 
                                     (platformData.engagement?.shares || 0);
        aggregated.totalReach += platformData.reach || 0;
        aggregated.totalImpressions += platformData.impressions || 0;
        count++;
      }
    } else {
      // Aggregate all platforms
      Object.values(item.socialMedia || {}).forEach(platformData => {
        aggregated.totalFollowers += platformData.followers || 0;
        aggregated.totalEngagement += (platformData.engagement?.likes || 0) + 
                                     (platformData.engagement?.comments || 0) + 
                                     (platformData.engagement?.shares || 0);
        aggregated.totalReach += platformData.reach || 0;
        aggregated.totalImpressions += platformData.impressions || 0;
        count++;
      });
    }
  });

  if (count > 0) {
    aggregated.averageEngagementRate = (aggregated.totalEngagement / aggregated.totalImpressions * 100).toFixed(2);
  }

  return aggregated;
}

function comparePlatformPerformance(analytics) {
  const platforms = ['instagram', 'facebook', 'twitter'];
  const comparison = {};

  platforms.forEach(platform => {
    comparison[platform] = {
      totalFollowers: 0,
      totalEngagement: 0,
      averageEngagementRate: 0,
      growth: 0
    };

    let count = 0;
    let totalEngagementRate = 0;

    analytics.forEach(item => {
      const platformData = item.socialMedia?.[platform];
      if (platformData) {
        comparison[platform].totalFollowers += platformData.followers || 0;
        comparison[platform].totalEngagement += (platformData.engagement?.likes || 0) + 
                                               (platformData.engagement?.comments || 0) + 
                                               (platformData.engagement?.shares || 0);
        totalEngagementRate += platformData.engagement?.rate || 0;
        count++;
      }
    });

    if (count > 0) {
      comparison[platform].averageEngagementRate = (totalEngagementRate / count).toFixed(2);
    }
  });

  return comparison;
}

function calculateEngagementTrends(analytics) {
  return analytics.map(item => ({
    date: item.date,
    instagram: item.socialMedia?.instagram?.engagement?.rate || 0,
    facebook: item.socialMedia?.facebook?.engagement?.rate || 0,
    twitter: item.socialMedia?.twitter?.engagement?.rate || 0
  }));
}

async function getTopPerformingPosts(cafeId, platform, daysAgo) {
  const dateFilter = new Date();
  dateFilter.setDate(dateFilter.getDate() - daysAgo);

  const filter = {
    cafe: cafeId,
    createdAt: { $gte: dateFilter },
    status: 'posted'
  };

  if (platform) {
    filter.platform = platform;
  }

  const posts = await SocialPost.find(filter)
    .limit(10)
    .sort({ createdAt: -1 });

  // Mock engagement data for each post
  return posts.map(post => ({
    ...post.toObject(),
    engagement: {
      likes: Math.floor(Math.random() * 200) + 10,
      comments: Math.floor(Math.random() * 50) + 2,
      shares: Math.floor(Math.random() * 20) + 1,
      rate: (Math.random() * 8 + 2).toFixed(2)
    }
  }));
}

function generateAudienceInsights(analytics) {
  // Mock audience insights
  return {
    demographics: {
      age: {
        '18-24': 25,
        '25-34': 35,
        '35-44': 25,
        '45-54': 10,
        '55+': 5
      },
      gender: {
        male: 45,
        female: 52,
        other: 3
      },
      location: {
        local: 60,
        regional: 30,
        national: 8,
        international: 2
      }
    },
    interests: [
      { name: 'Coffee', percentage: 85 },
      { name: 'Food & Dining', percentage: 72 },
      { name: 'Local Business', percentage: 68 },
      { name: 'Lifestyle', percentage: 45 },
      { name: 'Music & Entertainment', percentage: 38 }
    ],
    peakActivity: {
      days: ['Monday', 'Wednesday', 'Friday'],
      hours: ['8:00 AM', '12:00 PM', '6:00 PM']
    }
  };
}

function calculateCampaignPerformance(campaign, analytics) {
  const performance = {
    impressions: campaign.metrics.impressions || 0,
    clicks: campaign.metrics.clicks || 0,
    conversions: campaign.metrics.conversions || 0,
    spend: campaign.metrics.spend || 0,
    ctr: 0,
    conversionRate: 0,
    cpc: 0,
    roas: 0
  };

  if (performance.impressions > 0) {
    performance.ctr = ((performance.clicks / performance.impressions) * 100).toFixed(2);
  }

  if (performance.clicks > 0) {
    performance.conversionRate = ((performance.conversions / performance.clicks) * 100).toFixed(2);
  }

  if (performance.clicks > 0 && performance.spend > 0) {
    performance.cpc = (performance.spend / performance.clicks).toFixed(2);
  }

  if (performance.spend > 0) {
    const revenue = performance.conversions * 15; // Assume $15 average order value
    performance.roas = (revenue / performance.spend).toFixed(2);
  }

  return performance;
}

function generateCampaignTimeline(campaign, analytics) {
  const timeline = [];
  const startDate = new Date(campaign.schedule?.startDate || campaign.createdAt);
  const endDate = new Date(campaign.schedule?.endDate || new Date());

  // Generate timeline events
  timeline.push({
    date: startDate,
    event: 'Campaign Started',
    type: 'milestone',
    description: `${campaign.name} campaign launched`
  });

  if (campaign.status === 'completed' || campaign.status === 'cancelled') {
    timeline.push({
      date: endDate,
      event: 'Campaign Ended',
      type: 'milestone',
      description: `Campaign ${campaign.status}`
    });
  }

  return timeline;
}

function calculateROI(campaign) {
  const spend = campaign.metrics.spend || 0;
  const conversions = campaign.metrics.conversions || 0;
  const revenue = conversions * 15; // Assume $15 average order value

  if (spend === 0) return { roi: 0, revenue: 0, spend: 0 };

  const roi = ((revenue - spend) / spend * 100).toFixed(2);

  return {
    roi,
    revenue,
    spend,
    profit: revenue - spend
  };
}

function generateCampaignRecommendations(campaign, analytics) {
  const recommendations = [];

  const performance = calculateCampaignPerformance(campaign, analytics);

  if (parseFloat(performance.ctr) < 2) {
    recommendations.push({
      type: 'optimization',
      priority: 'high',
      title: 'Improve Click-Through Rate',
      description: 'Your CTR is below average. Consider improving your ad copy and visuals.'
    });
  }

  if (parseFloat(performance.conversionRate) < 3) {
    recommendations.push({
      type: 'conversion',
      priority: 'medium',
      title: 'Optimize Landing Page',
      description: 'Low conversion rate suggests issues with your landing page or offer.'
    });
  }

  if (parseFloat(performance.roas) < 3) {
    recommendations.push({
      type: 'budget',
      priority: 'high',
      title: 'Review Budget Allocation',
      description: 'Your return on ad spend is below profitable levels.'
    });
  }

  return recommendations;
}

async function generateAnalyticsReport(cafe, analytics, reportType, includePlatforms, includeMetrics, period) {
  const report = {
    cafe: {
      name: cafe.name,
      id: cafe._id
    },
    period,
    reportType,
    generatedAt: new Date(),
    summary: {},
    details: {},
    recommendations: []
  };

  // Generate summary based on report type
  switch (reportType) {
    case 'social_media':
      report.summary = aggregateSocialMediaData(analytics);
      report.details.platformComparison = comparePlatformPerformance(analytics);
      break;
    case 'campaigns':
      // Add campaign-specific reporting
      break;
    case 'comprehensive':
      report.summary = {
        socialMedia: aggregateSocialMediaData(analytics),
        business: calculateBusinessMetrics(analytics)
      };
      break;
  }

  return report;
}

function calculateBusinessMetrics(analytics) {
  let totalRevenue = 0;
  let totalOrders = 0;
  let totalLeads = 0;

  analytics.forEach(item => {
    totalRevenue += item.business?.revenue || 0;
    totalOrders += item.business?.orders || 0;
    totalLeads += item.business?.leads?.generated || 0;
  });

  return {
    totalRevenue,
    totalOrders,
    totalLeads,
    averageOrderValue: totalOrders > 0 ? (totalRevenue / totalOrders).toFixed(2) : 0
  };
}

module.exports = router;