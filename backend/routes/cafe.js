const express = require('express');
const { body, validationResult } = require('express-validator');
const Cafe = require('../models/cafe');
const auth = require('../middleware/auth');

const router = express.Router();

// @route   GET api/cafes
// @desc    Get all cafes for logged in user
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const cafes = await Cafe.find({ owner: req.user.id }).sort({ date: -1 });
    res.json(cafes);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/cafes
// @desc    Add new cafe
// @access  Private
router.post('/', [auth, [
  body('name', 'Name is required').not().isEmpty(),
  body('address', 'Address is required').not().isEmpty(),
]], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name, address, phone, description, website, socialMedia } = req.body;

  try {
    const newCafe = new Cafe({
      name,
      address,
      phone,
      description,
      website,
      socialMedia,
      owner: req.user.id
    });

    const cafe = await newCafe.save();
    res.json(cafe);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT api/cafes/:id
// @desc    Update cafe
// @access  Private
router.put('/:id', auth, async (req, res) => {
  const { name, address, phone, description, website, socialMedia } = req.body;

  const cafeFields = {};
  if (name) cafeFields.name = name;
  if (address) cafeFields.address = address;
  if (phone) cafeFields.phone = phone;
  if (description) cafeFields.description = description;
  if (website) cafeFields.website = website;
  if (socialMedia) cafeFields.socialMedia = socialMedia;

  try {
    let cafe = await Cafe.findById(req.params.id);

    if (!cafe) return res.status(404).json({ msg: 'Cafe not found' });

    if (cafe.owner.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized' });
    }

    cafe = await Cafe.findByIdAndUpdate(req.params.id,
      { $set: cafeFields },
      { new: true }
    );

    res.json(cafe);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   DELETE api/cafes/:id
// @desc    Delete cafe
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    let cafe = await Cafe.findById(req.params.id);

    if (!cafe) return res.status(404).json({ msg: 'Cafe not found' });

    if (cafe.owner.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized' });
    }

    await Cafe.findByIdAndDelete(req.params.id);

    res.json({ msg: 'Cafe removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;