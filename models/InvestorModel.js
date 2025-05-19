<<<<<<< HEAD
const mongoose = require('mongoose');

const investorSchema = new mongoose.Schema({
  investorType: {
    type: String,
    required: true,
    enum: ['angel', 'vc']
  },
  // Common fields
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  linkedinProfile: {
    type: String,
    required: true,
    trim: true
  },
  contactNumber: {
    type: String,
    required: true,
    trim: true
  },
  website: {
    type: String,
    trim: true
  },
  stage: {
    type: String,
    required: true,
    enum: ['seed', 'pre-seed', 'early', 'growth', 'stage-agnostic']
  },
  industry: {
    type: String,
    required: true,
    enum: [
      'ai/ml',
      'agritech',
      'consumer',
      'digital-entertainment',
      'edtech',
      'fintech',
      'healthtech',
      'media',
      'mobility',
      'saas',
      'industry-agnostic'
    ]
  },
  // Angel Investor specific fields
  investorName: {
    type: String,
    required: function () { return this.investorType === 'angel'; }
  },
  // VC specific fields
  firmName: {
    type: String,
    required: function () { return this.investorType === 'vc'; }
  },
  firmLogo: {
    type: String,
    required: function () { return this.investorType === 'vc'; }
  },
  pointOfContact: {
    type: String,
    required: function () { return this.investorType === 'vc'; }
  },
  isDeleted: {
    type: Boolean,
    default: false
  },
  skills: {
    type: [String],
    default: [],
    validate: {
      validator: function (v) {
        return v.length <= 20; // Maximum 20 skills allowed
      },
      message: 'Cannot have more than 20 skills'
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Middleware to filter deleted documents
investorSchema.pre(['find', 'findOne', 'findById'], function () {
  this.where({ isDeleted: false });
});

=======
const mongoose = require('mongoose');

const investorSchema = new mongoose.Schema({
  investorType: {
    type: String,
    required: true,
    enum: ['angel', 'vc']
  },
  // Common fields
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  linkedinProfile: {
    type: String,
    required: true,
    trim: true
  },
  contactNumber: {
    type: String,
    required: true,
    trim: true
  },
  website: {
    type: String,
    trim: true
  },
  stage: {
    type: String,
    required: true,
    enum: ['seed', 'pre-seed', 'early', 'growth', 'stage-agnostic']
  },
  industry: {
    type: String,
    required: true,
    enum: [
      'ai/ml',
      'agritech',
      'consumer',
      'digital-entertainment',
      'edtech',
      'fintech',
      'healthtech',
      'media',
      'mobility',
      'saas',
      'industry-agnostic'
    ]
  },
  // Angel Investor specific fields
  investorName: {
    type: String,
    required: function () { return this.investorType === 'angel'; }
  },
  // VC specific fields
  firmName: {
    type: String,
    required: function () { return this.investorType === 'vc'; }
  },
  firmLogo: {
    type: String,
    required: function () { return this.investorType === 'vc'; }
  },
  pointOfContact: {
    type: String,
    required: function () { return this.investorType === 'vc'; }
  },
  isDeleted: {
    type: Boolean,
    default: false
  },
  skills: {
    type: [String],
    default: [],
    validate: {
      validator: function (v) {
        return v.length <= 20; // Maximum 20 skills allowed
      },
      message: 'Cannot have more than 20 skills'
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Middleware to filter deleted documents
investorSchema.pre(['find', 'findOne', 'findById'], function () {
  this.where({ isDeleted: false });
});

>>>>>>> ee7c4e0a3e33160cc4ec5e4b485aae5dce824f21
module.exports = mongoose.model('Investor', investorSchema);