const mongoose = require('mongoose');

const ApplicationSchema = new mongoose.Schema({
    email: { type: String, required: true },
    brand_name: { type: String, required: true },
    legal_name: { type: String, required: true },
    founded_date: { type: Date, required: true },
    brief: { type: String, required: true },
    domain: { type: String, required: true },
    stage: { type: String, required: true },
    website: { type: String, required: true },
    linkedin: { type: String, required: true },
    pitch_deck: { type: String, required: true },
    status: {
        type: String,
        enum: ['Pending', 'Shortlisted', 'Rejected', 'Interview'],
        default: 'Pending'
    },
    applied_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Application', ApplicationSchema);