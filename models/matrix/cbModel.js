// models/matrix/cbModel.js

const mongoose = require('mongoose');

const CbSchema = new mongoose.Schema({
    startup_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Startup', required: true },
    year: { type: Number, required: true },
    month: { type: Number, required: true, min: 1, max: 12 },
    cash_burn: { type: Number, required: true }, // Net Cash Flow (can be negative/positive)
    // Optionally: cash_inflow, cash_outflow
    createdAt: { type: Date, default: Date.now },
});

CbSchema.index({ startup_id: 1, year: 1, month: 1 }, { unique: true });
module.exports = mongoose.model('CashBurn', CbSchema);