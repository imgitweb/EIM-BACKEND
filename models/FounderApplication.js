const mongoose = require('mongoose');

const ApplicationSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true
    },
    brand_name: { // Stores "Startup Name"
        type: String,
        required: true,
        trim: true
    },
    legal_name: {
        type: String,
        required: true,
        trim: true
    },
    founded_date: {
        type: Date,
        required: true
    },
    brief: {
        type: String,
        required: true,
        trim: true
    },
    domain: {
        type: String,
        required: true,
        trim: true
    },
    stage: {
        type: String,
        required: true,
        enum: ['Idea', 'Growth', 'MVP', 'Scaling', 'Early_Traction', 'Acceleration', 'Pre_Product', 'Pre_Revenue', 'PMF']
    },
    website: {
        type: String,
        required: true,
        trim: true
    },
    linkedin: {
        type: String,
        required: true,
        trim: true
    },
    pitch_deck: {
        type: String,
        required: true
        // Stores the file path (e.g., "uploads/deck-123.pdf")
    },
    status: {
        type: String,
        enum: ['Pending', 'Shortlisted', 'Rejected', 'Interview'],
        default: 'Pending'
    },
    applied_at: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Application', ApplicationSchema);