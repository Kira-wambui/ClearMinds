const express = require('express');
const router = express.Router();
const Strategy = require('../models/Strategy');
const auth = require('../middleware/auth');

// Helper function to parse pagination parameters
const parsePagination = (query) => {
  const limit = Math.max(1, parseInt(query.limit, 10) || 10);
  const offset = Math.max(0, parseInt(query.offset, 10) || 0);
  return { limit, offset };
};

// GET all strategies (with pagination)
router.get('/', async (req, res) => {
  try {
    const { limit, offset } = parsePagination(req.query);
    const strategies = await Strategy.find().sort({ title: 1 }).skip(offset).limit(limit);
    const total = await Strategy.countDocuments();
    res.json({ total, limit, offset, strategies });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET strategies by category
router.get('/:category', async (req, res) => {
  try {
    const { category } = req.params;
    const { limit, offset } = parsePagination(req.query);
    const strategies = await Strategy.find({ category }).skip(offset).limit(limit);
    const total = await Strategy.countDocuments({ category });
    res.json({ total, limit, offset, strategies });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET search strategies
router.get('/search', async (req, res) => {
  try {
    const { q } = req.query;
    const { limit, offset } = parsePagination(req.query);
    const strategies = await Strategy.find({ $text: { $search: q } }).skip(offset).limit(limit);
    const total = await Strategy.countDocuments({ $text: { $search: q } });
    res.json({ total, limit, offset, strategies });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET random strategy
router.get('/random', async (req, res) => {
  try {
    const count = await Strategy.countDocuments();
    const rand = Math.floor(Math.random() * count);
    const strategy = await Strategy.findOne().skip(rand);
    res.json(strategy);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST add new strategy (admin only)
router.post('/', auth, async (req, res) => {
  try {
    if (!req.user.isAdmin) {
      return res.status(403).json({ error: 'Admin access required.' });
    }
    const strategy = new Strategy(req.body);
    await strategy.save();
    res.status(201).json(strategy);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT update strategy (admin only)
router.put('/:id', auth, async (req, res) => {
  try {
    if (!req.user.isAdmin) {
      return res.status(403).json({ error: 'Admin access required.' });
    }
    const strategy = await Strategy.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!strategy) {
      return res.status(404).json({ error: 'Strategy not found.' });
    }
    res.json(strategy);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// POST rate a strategy
router.post('/:id/rate', auth, async (req, res) => {
  try {
    const { rating, feedback } = req.body;
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5.' });
    }
    const strategy = await Strategy.findById(req.params.id);
    if (!strategy) {
      return res.status(404).json({ error: 'Strategy not found.' });
    }
    strategy.ratings.push({ user: req.user._id, score: rating, feedback });
    await strategy.save();
    const avgRating = strategy.ratings.reduce((sum, r) => sum + r.score, 0) / strategy.ratings.length;
    res.json({ averageRating: avgRating });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
