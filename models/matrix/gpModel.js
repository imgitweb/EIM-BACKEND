// models/matrix/gpModel.js

const mongoose = require('mongoose');

const GpSchema = new mongoose.Schema({
    startup_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Startup', required: true },
    year: { type: Number, required: true },
    month: { type: Number, required: true, min: 1, max: 12 },
    gross_profit: { type: Number, required: true }, // Can be negative
    // Optionally: total_revenue, cogs (Cost of Goods Sold)
    createdAt: { type: Date, default: Date.now },
});

GpSchema.index({ startup_id: 1, year: 1, month: 1 }, { unique: true });
module.exports = mongoose.model('GrossProfit', GpSchema);