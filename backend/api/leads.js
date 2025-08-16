const express = require('express');
const ContactLead = require('../models/ContactLead');
const { auth, adminOnly } = require('../utils/authMiddleware');
const axios = require('axios');

const router = express.Router();

// Get all leads (admin only)
router.get('/', [auth, adminOnly], async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.query.status) filter.contactStatus = req.query.status;
    if (req.query.source) filter.source = req.query.source;
    if (req.query.businessType) filter.businessType = req.query.businessType;

    const leads = await ContactLead.find(filter)
      .populate('assignedTo', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await ContactLead.countDocuments(filter);

    res.json({
      leads,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

// Get lead by ID
router.get('/:id', [auth, adminOnly], async (req, res) => {
  try {
    const lead = await ContactLead.findById(req.params.id)
      .populate('assignedTo', 'name email');
    
    if (!lead) {
      return res.status(404).json({ msg: 'Lead not found' });
    }

    res.json(lead);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

// Create new lead
router.post('/', [auth, adminOnly], async (req, res) => {
  try {
    const leadData = { ...req.body };
    
    // Check if lead already exists
    const existingLead = await ContactLead.findOne({
      $or: [
        { email: leadData.email },
        { businessName: leadData.businessName, phone: leadData.phone }
      ]
    });

    if (existingLead) {
      return res.status(400).json({ msg: 'Lead already exists' });
    }

    const newLead = new ContactLead(leadData);
    const lead = await newLead.save();

    res.json(lead);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

// Update lead
router.put('/:id', [auth, adminOnly], async (req, res) => {
  try {
    const lead = await ContactLead.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: Date.now() },
      { new: true }
    ).populate('assignedTo', 'name email');

    if (!lead) {
      return res.status(404).json({ msg: 'Lead not found' });
    }

    res.json(lead);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

// Delete lead
router.delete('/:id', [auth, adminOnly], async (req, res) => {
  try {
    const lead = await ContactLead.findById(req.params.id);

    if (!lead) {
      return res.status(404).json({ msg: 'Lead not found' });
    }

    await ContactLead.findByIdAndDelete(req.params.id);
    res.json({ msg: 'Lead deleted successfully' });
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

// Scrape leads from Google Maps (mock implementation)
router.post('/scrape/google-maps', [auth, adminOnly], async (req, res) => {
  try {
    const { location, businessType = 'cafe', radius = 10 } = req.body;

    // Mock implementation - in production, this would use Google Places API
    const mockLeads = [
      {
        businessName: `Sample Cafe ${Math.floor(Math.random() * 100)}`,
        email: `contact${Math.floor(Math.random() * 1000)}@samplecafe.com`,
        phone: `+1${Math.floor(Math.random() * 9000000000) + 1000000000}`,
        address: `${Math.floor(Math.random() * 999)} Main St, ${location}`,
        website: `https://samplecafe${Math.floor(Math.random() * 100)}.com`,
        socialMedia: {
          googleMaps: `https://maps.google.com/place/sample-cafe-${Math.floor(Math.random() * 100)}`
        },
        businessType,
        source: 'google_maps',
        location: {
          city: location,
          country: 'USA'
        }
      }
    ];

    const savedLeads = [];
    for (const leadData of mockLeads) {
      // Check if lead already exists
      const existingLead = await ContactLead.findOne({
        businessName: leadData.businessName
      });

      if (!existingLead) {
        const newLead = new ContactLead(leadData);
        const savedLead = await newLead.save();
        savedLeads.push(savedLead);
      }
    }

    res.json({ 
      msg: `Scraped ${savedLeads.length} new leads from Google Maps`,
      leads: savedLeads 
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

// Bulk import leads
router.post('/import', [auth, adminOnly], async (req, res) => {
  try {
    const { leads } = req.body;

    if (!Array.isArray(leads)) {
      return res.status(400).json({ msg: 'Leads must be an array' });
    }

    const importResults = {
      successful: 0,
      skipped: 0,
      errors: []
    };

    for (const leadData of leads) {
      try {
        // Check if lead already exists
        const existingLead = await ContactLead.findOne({
          $or: [
            { email: leadData.email },
            { businessName: leadData.businessName }
          ]
        });

        if (existingLead) {
          importResults.skipped++;
          continue;
        }

        const newLead = new ContactLead(leadData);
        await newLead.save();
        importResults.successful++;
      } catch (error) {
        importResults.errors.push({
          lead: leadData.businessName || 'Unknown',
          error: error.message
        });
      }
    }

    res.json(importResults);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

// Get lead statistics
router.get('/stats/overview', [auth, adminOnly], async (req, res) => {
  try {
    const totalLeads = await ContactLead.countDocuments();
    const newLeads = await ContactLead.countDocuments({ contactStatus: 'new' });
    const contactedLeads = await ContactLead.countDocuments({ contactStatus: 'contacted' });
    const convertedLeads = await ContactLead.countDocuments({ contactStatus: 'converted' });

    const sourceStats = await ContactLead.aggregate([
      { $group: { _id: '$source', count: { $sum: 1 } } }
    ]);

    const monthlyStats = await ContactLead.aggregate([
      {
        $match: {
          createdAt: { 
            $gte: new Date(new Date().getFullYear(), new Date().getMonth() - 11, 1) 
          }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    res.json({
      overview: {
        total: totalLeads,
        new: newLeads,
        contacted: contactedLeads,
        converted: convertedLeads,
        conversionRate: totalLeads > 0 ? ((convertedLeads / totalLeads) * 100).toFixed(2) : 0
      },
      sourceBreakdown: sourceStats,
      monthlyTrend: monthlyStats
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;