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
    // Raw Spend/Customer Fields (REQUIRED)
    marketing_spend: { 
        type: Number, 
        required: true, 
        min: 0 
    },
    sales_spend: { 
        type: Number, 
        required: true, 
        min: 0 
    },
    calculated_cac: { 
        type: Number, min: 0 
    },
    
    new_customer: { 
        type: Number, 
        required: true, 
        min: 0 
    },
    // Calculated CAC Field (Optional, for easy retrieval)
    calculated_cac: { 
        type: Number, 
        min: 0 
    },
    createdAt: { 
        type: Date, 
        default: Date.now 
    },
});

CACSchema.index({ startup_id: 1, year: 1, month: 1 }, { unique: true });

module.exports = mongoose.model('CAC', CACSchema);