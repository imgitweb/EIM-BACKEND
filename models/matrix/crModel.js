// models/matrix/crModel.js

const mongoose = require('mongoose');

const CrSchema = new mongoose.Schema({
    startup_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Startup', required: true },
    year: { type: Number, required: true },
    month: { type: Number, required: true, min: 1, max: 12 },
    churn_rate: { type: Number, required: true, min: 0, max: 100 }, // Stored as a percentage (0-100)
    // Optionally: starting_customers, customers_lost
    createdAt: { type: Date, default: Date.now },
});

CrSchema.index({ startup_id: 1, year: 1, month: 1 }, { unique: true });
module.exports = mongoose.model('ChurnRate', CrSchema);