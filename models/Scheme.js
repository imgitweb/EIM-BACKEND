const mongoose = require('mongoose');

const schemeSchema = new mongoose.Schema({
  id: {
    type: Number,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  shortName: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ['government-of-india', 'state-government', 'international'],
    required: true
  },
  description: {
    type: String,
    required: true
  },
  fullDescription: {
    type: String,
    required: true
  },
  detailedBenefits: [{
    type: String,
    required: true
  }],
  detailedEligibility: [{
    type: String,
    required: true
  }],
  applicationProcess: [{
    type: String,
    required: true
  }],
  documentsRequired: [{
    type: String,
    required: true
  }],
  applyUrl: {  
    type: String,
    required: false,
    default: 'https://www.startupindia.gov.in/'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Scheme', schemeSchema);