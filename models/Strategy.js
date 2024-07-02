const mongoose = require('mongoose');

const StrategySchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  category: {
    type: String,
    required: true,
    enum: ['overstimulation', 'emotional-breakdown', 'panic-attack', 'social-anxiety', 'focus-assist'],
    index: true
  },
  subtype: {
    type: String,
    required: true,
    enum: {
      'overstimulation': ['sensory-retreat', 'grounding', 'slow-input'],
      'emotional-breakdown': ['self-soothing', 'emotional-release', 'cognitive-reframing'],
      'panic-attack': ['breathing', 'physical', 'mental-distraction'],
      'social-anxiety': ['preparation', 'in-the-moment', 'recovery'],
      'focus-assist': ['ambient-sound', 'binaural-beats', 'nature-sounds', 'white-noise']
    }
  },
  steps: [{ instruction: String, duration: Number }],
  tools: [{ name: String, optional: Boolean }],
  duration: { type: Number, required: true },
  intensity: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
  environment: { type: String, enum: ['any', 'quiet', 'private'], default: 'any' },
  benefits: [String],
  warnings: [String],
  resources: [{ title: String, url: String }]
});

module.exports = mongoose.model('Strategy', StrategySchema);