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
    required: true,
    trim: true
  },
  country: {
    type: String,
    required: true,
    trim: true
  },
  userType: {
    type: String,
    required: true,
    trim: true
  },
  organization: {
    type: String,
    trim: true,
    default: null  // Optional field
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

// Indexes for performance
contactSchema.index({ email: 1 });
contactSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Contact', contactSchema);