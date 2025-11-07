const mongoose = require('mongoose');

const ValuationSchema = new mongoose.Schema({
    method: {
        type: String,
        required: true,
        trim: true
    },
    inputs: {
        type: Object, 
        required: true
    },
    result: {
        type: Number, 
        required: true
    },
    calculatedAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Valuation', ValuationSchema);