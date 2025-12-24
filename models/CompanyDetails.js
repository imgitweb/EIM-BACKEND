const mongoose = require('mongoose');

const companyDetailsSchema = new mongoose.Schema({
  companyName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 255
  },
  email: {
    type: String,
    required: true,
    trim: true,
    maxlength: 255,
    lowercase: true
  },
  phone: {
    type: String,
    trim: true,
    maxlength: 20
  },
  address: {
    type: String,
    trim: true,
    maxlength: 500
  },
  city: {
    type: String,
    trim: true,
    maxlength: 100
  },
  state: {
    type: String,
    trim: true,
    maxlength: 100
  },
  zipCode: {
    type: String,
    trim: true,
    maxlength: 10
  },
  website: {
    type: String,
    trim: true,
    maxlength: 255
  },
  hasRegistration: {
    type: String,
    enum: ['Yes', 'No'],
    required: true,
    default: 'Yes'
  },
  industry: {
    type: String,
    trim: true,
    maxlength: 100
  },
  employees: {
    type: String,
    trim: true,
    maxlength: 50
  },
  registrationType: {
    type: String,
    trim: true,
    maxlength: 100
  },
  gstNumber: {
    type: String,
    trim: true,
    maxlength: 15
  },
  panNumber: {
    type: String,
    trim: true,
    maxlength: 10
  },
  gstDocument: {
    type: String 
  },
  panDocument: {
    type: String 
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'StartupModel',
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('CompanyDetails', companyDetailsSchema);