const express = require('express');
const router = express.Router();
const Strategy = require('../models/Strategy');
const auth = require('../middleware/auth');

// GET all strategies (with pagination)
router.get('/', async (req, res) => {
  try {
    const { limit = 10, offset = 0 } = req.query;
    const strategies = await Strategy.find()
      .sort({ title: 1 })
      .skip(Number(offset))
      .limit(Number(limit));
    const total = await Strategy.countDocuments();
    res.json({ total, limit: Number(limit), offset: Number(offset), strategies });
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// GET strategies by category
router.get('/:category', async (req, res) => {
  try {
    const { category } = req.params;
    const { limit = 10, offset = 0 } = req.query;
    const strategies = await Strategy.find({ category })
      .skip(Number(offset))
      .limit(Number(limit));
    const total = await Strategy.countDocuments({ category });
    res.json({ total, limit: Number(limit), offset: Number(offset), strategies });
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// GET search strategies
router.get('/search', async (req, res) => {
  try {
    const { q, limit = 10, offset = 0 } = req.query;
    const strategies = await Strategy.find({ $text: { $search: q } })
      .skip(Number(offset))
      .limit(Number(limit));
    const total = await Strategy.countDocuments({ $text: { $search: q } });
    res.json({ total, limit: Number(limit), offset: Number(offset), strategies });
  } catch (err) {
    res.status(500).send(err.message);
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
    res.status(500).send(err.message);
  }
});

// POST add new strategy (admin only)
router.post('/', auth, async (req, res) => {
  try {
    if (!req.user.isAdmin) return res.status(403).send('Admin access required.');
    const strategy = new Strategy(req.body);
    await strategy.save();
    res.status(201).json(strategy);
  } catch (err) {
    res.status(400).send(err.message);
  }
});

// PUT update strategy (admin only)
router.put('/:id', auth, async (req, res) => {
  try {
    if (!req.user.isAdmin) return res.status(403).send('Admin access required.');
    const strategy = await Strategy.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!strategy) return res.status(404).send('Strategy not found.');
    res.json(strategy);
  } catch (err) {
    res.status(400).send(err.message);
  }
});

// POST rate a strategy
router.post('/:id/rate', auth, async (req, res) => {
  try {
    const { rating, feedback } = req.body;
    const strategy = await Strategy.findById(req.params.id);
    if (!strategy) return res.status(404).send('Strategy not found.');
    
    strategy.ratings.push({ user: req.user._id, score: rating, feedback });
    await strategy.save();
    
    const avgRating = strategy.ratings.reduce((sum, r) => sum + r.score, 0) / strategy.ratings.length;
    res.json({ averageRating: avgRating });
  } catch (err) {
    res.status(400).send(err.message);
  }
});

module.exports = router;