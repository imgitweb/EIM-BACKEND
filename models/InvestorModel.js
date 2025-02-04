const mongoose = require('mongoose');

const investorSchema = new mongoose.Schema({
  companyName: {
    type: String,
    required: true,
    trim: true
  },
  founderName: {
    type: String,
    required: true,
    trim: true
  },
  companyLogo: {
    type: String,  // URL to the stored image
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  website: {
    type: String,
    required: true,
    trim: true
  },
  aboutUs: {
    type: String,
    required: true
  },
  idealFor: {
    type: String,
    required: true,
    enum: ['pre-seed', 'seed', 'early', 'growth']
  },
  industry: {
    type: String,
    required: true,
    enum: [
      'ai/ml',
      'agritech',
      'consumer',
      'digital entertainment',
      'edtech',
      'fintech',
      'healthtech',
      'media',
      'mobility',
      'saas'
    ]
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Investor', investorSchema);