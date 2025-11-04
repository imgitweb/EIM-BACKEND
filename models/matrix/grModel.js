// grModel.js
const mongoose = require('mongoose');

const grSchema = new mongoose.Schema({
  startup_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Startup', required: true },
  year: { type: Number, required: true },
  month: { type: Number, required: true, min: 1, max: 12 },
  gross_revenue: { type: Number, required: true, min: 0 },
}, { timestamps: true });

// Unique index lagane se ek mahine ka data double nahi hoga
grSchema.index({ startup_id: 1, year: 1, month: 1 }, { unique: true });

module.exports = mongoose.model('GrossRevenue', grSchema);