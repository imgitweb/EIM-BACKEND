
const mongoose = require('mongoose');

const CACSchema = new mongoose.Schema({
    startup_id: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Startup', 
        required: true 
    },
    year: { 
        type: Number, 
        required: true 
    },
    month: { 
        type: Number, 
        required: true, 
        min: 1, 
        max: 12 
    },
    cac: { 
        type: Number, 
        required: true, 
        min: 0 
    },
    createdAt: { 
        type: Date, 
        default: Date.now 
    },
});

CACSchema.index({ startup_id: 1, year: 1, month: 1 }, { unique: true });

module.exports = mongoose.model('CAC', CACSchema);