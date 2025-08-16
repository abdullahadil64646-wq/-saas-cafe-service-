const express = require('express');
const SocialPost = require('../models/socialpost');
const auth = require('../middleware/auth');

const router = express.Router();

// @route   GET api/social/posts
// @desc    Get all social posts for user
// @access  Private
router.get('/posts', auth, async (req, res) => {
  try {
    const posts = await SocialPost.find({ cafe: req.query.cafeId }).sort({ scheduledDate: -1 });
    res.json(posts);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/social/generate
// @desc    Generate AI content
// @access  Private
router.post('/generate', auth, async (req, res) => {
  try {
    const { prompt, cafeId } = req.body;
    
    // Mock AI generated content for now
    const generatedContent = `🌟 Welcome to our cozy cafe! ☕ ${prompt} Come visit us for the best coffee experience in town! #coffee #cafe #local #community`;
    
    res.json({ 
      content: generatedContent,
      hashtags: ['#coffee', '#cafe', '#local', '#community']
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/social/schedule
// @desc    Schedule social media post
// @access  Private
router.post('/schedule', auth, async (req, res) => {
  try {
    const { content, platform, scheduledDate, cafeId } = req.body;

    const newPost = new SocialPost({
      content,
      platform,
      scheduledDate,
      cafe: cafeId,
      status: 'scheduled'
    });

    const post = await newPost.save();
    res.json(post);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;