const mongoose = require('mongoose');

const ValuationSchema = new mongoose.Schema({
  method: {
    type: String,
    required: true,
    trim: true,
    enum: [
      'Berkus Method (Ideation Stage)',
      'Scorecard Method',
      'Discounted Cash Flow (DCF)',
      'Revenue Multiple Method'
    ]
  },
  inputs: {
    type: Object,
    required: true
  },
  result: {
    type: Number,
    required: true,
    min: 0
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false 
  },
  calculatedAt: {
    type: Date,
    default: Date.now,
    expires: 60 * 60 * 24 * 90 
  }
}, {
  timestamps: true
});

ValuationSchema.index({ user: 1, calculatedAt: -1 });
ValuationSchema.index({ method: 1 });

module.exports = mongoose.model('Valuation', ValuationSchema);