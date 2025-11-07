

const mongoose = require('mongoose');

const NrSchema = new mongoose.Schema({
    startup_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Startup', required: true },
    year: { type: Number, required: true },
    month: { type: Number, required: true, min: 1, max: 12 },
    net_revenue: { type: Number, required: true, min: 0 },
    // Optionally: gross_revenue, returns_allowances for context/calculation
    createdAt: { type: Date, default: Date.now },
});

NrSchema.index({ startup_id: 1, year: 1, month: 1 }, { unique: true });
module.exports = mongoose.model('NetRevenue', NrSchema);