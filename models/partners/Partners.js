const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const partnerSchema = new Schema({
  name: { type: String, required: true },
  designation: { type: String },
  companyName: { type: String },
  contactNumber: {
    type : Number,
  },
  email: { type: String, required: true, unique: true },
  linkedinUrl: { type: String },
  location: { type: String },
  partnerType: { type: String, enum: ['Investor', 'Mentor', 'Other' , "Legal"], required: true },
  imageUrl: { type: String },
  industry: { type: String },
  websiteUrl: { type: String },
  description: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Partner', partnerSchema);