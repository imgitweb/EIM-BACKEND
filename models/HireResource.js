const mongoose = require('mongoose');

// Schema Definition (Based on the 'resources' array in your component)
const HireResourceSchema = new mongoose.Schema({
    // Professional Information
    name: { type: String, required: true },
    role: { type: String, required: true },
    
    // Category (Used for Filter Pills)
    category: {
        type: String,
        
        enum: ['development', 'design', 'marketing', 'management', 'content'], 
        required: true
    },
    
    // Location and Rate
    location: { type: String, required: true },
    rate: { type: String, required: true }, 
    
    // Ratings and Reviews
    rating: { type: Number, min: 0, max: 5, default: 0 },
    reviews: { type: Number, default: 0 },
    
    // Skills and Availability
    skills: [{ type: String }], 
    availability: { type: String, required: true }, 
}, { 
    timestamps: true 
});


HireResourceSchema.index({ name: 'text', role: 'text', skills: 'text' }); 

module.exports = mongoose.model('HireResource', HireResourceSchema);