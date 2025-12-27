// models/Contact.js
const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  phone: {
    type: String,
    required: true
  },
  interest: {
    type: String,
    default: null
  },
  note: {
    type: String,
    default: null
  },
  type: {
    type: String,
    enum: ['contact', 'schedule', 'demo'],
    default: 'contact'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Create index for fast email lookup (prevents slow queries)
contactSchema.index({ email: 1 });

module.exports = mongoose.model('Contact', contactSchema);