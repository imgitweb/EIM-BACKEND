const Valuation = require('../models/Valuation');
const User = require("../models/signup/StartupModel")
const valuationService = require('../services/valuationService');

exports.calculateAndSaveValuation = async (req, res) => {
  const { method, inputs } = req.body;

  if (!method || !inputs || typeof inputs !== 'object') {
    return res.status(400).json({
      success: false,
      message: 'Method and inputs (object) are required.'
    });
  }

  let result;
  let methodTitle;

  try {
    switch (method) {
      case 'berkus':
        result = valuationService.calculateBerkus(inputs);
        methodTitle = 'Berkus Method (Ideation Stage)';
        break;

      case 'scorecard':
        result = valuationService.calculateScorecard(inputs);
        methodTitle = 'Scorecard Method';
        break;

      case 'dcf':
        result = valuationService.calculateDCF(inputs);
        methodTitle = 'Discounted Cash Flow (DCF)';
        break;

      case 'multiple':
      case 'revenue_multiple':
      case 'vc_method':
        result = valuationService.calculateRevenueMultiple(inputs);
        methodTitle = 'Revenue Multiple Method';
        break;

      default:
        return res.status(400).json({
          success: false,
          message: `Invalid method: ${method}`
        });
    }

    const record = new Valuation({
      method: methodTitle,
      inputs,
      result,
      user: req.user?._id || null
    });
    await record.save();

    return res.status(200).json({
      success: true,
      method: methodTitle,
      valuation: result,
      saved: true
    });

  } catch (error) {
    console.error('Valuation Error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Calculation failed',
      error: error.message
    });
  }
};