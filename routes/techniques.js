const express = require('express');
const router = express.Router();
const Strategy = require('../models/Strategy');

// Middleware for validation and error handling
const validateCategory = (req, res, next) => {
  const { category } = req.params;
  if (!category) {
    return res.status(400).send('Category is required');
  }
  next();
};

// GET techniques by category
router.get('/:category', validateCategory, async (req, res) => {
  try {
    const { category } = req.params;
    const { subtype, intensity, duration, page = 1, limit = 10 } = req.query;

    let query = { category };
    if (subtype) query.subtype = subtype;
    if (intensity) query.intensity = intensity;
    if (duration) query.duration = { $lte: Number(duration) };

    const techniques = await Strategy.find(query)
      .sort({ duration: 1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json(techniques);
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
});

// GET random or recommended focus sound
router.get('/focus-assist/sound', async (req, res) => {
  try {
    const natureSounds = [
      'https://example.com/sounds/rain.mp3',
      'https://example.com/sounds/forest.mp3',
      'https://example.com/sounds/ocean.mp3',
    ];
    const randomSound = natureSounds[Math.floor(Math.random() * natureSounds.length)];

    res.json({ audioUrl: randomSound });
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
});

// GET random technique for a category
router.get('/:category/random', validateCategory, async (req, res) => {
  try {
    const { category } = req.params;
    const count = await Strategy.countDocuments({ category });
    if (count === 0) {
      return res.status(404).send('No techniques found for the specified category');
    }
    const rand = Math.floor(Math.random() * count);
    const technique = await Strategy.findOne({ category }).skip(rand);
    res.json(technique);
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
});

// GET techniques by strategy
router.get('/strategy/:strategy', async (req, res) => {
  try {
    const { strategy } = req.params;
    const techniques = await Strategy.find({ strategy });

    if (techniques.length === 0) {
      return res.status(404).send('No techniques found for the specified strategy');
    }

    res.json(techniques);
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
});

// POST add new technique
router.post('/', async (req, res) => {
  try {
    const technique = new Strategy(req.body);
    await technique.save();
    res.status(201).json(technique);
  } catch (err) {
    res.status(400).send({ error: err.message });
  }
});

module.exports = router;
