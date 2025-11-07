// models/matrix/clvModel.js

const mongoose = require('mongoose');

const ClvSchema = new mongoose.Schema({
    startup_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Startup', required: true },
    year: { type: Number, required: true },
    month: { type: Number, required: true, min: 1, max: 12 },
    clv: { type: Number, required: true, min: 0 },
    // Optionally: avg_purchase_value, purchase_frequency, avg_lifespan
    createdAt: { type: Date, default: Date.now },
});

ClvSchema.index({ startup_id: 1, year: 1, month: 1 }, { unique: true });
module.exports = mongoose.model('CLV', ClvSchema);