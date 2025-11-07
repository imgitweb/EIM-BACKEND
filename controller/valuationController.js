
const valuationService = require('../services/valuationService');
const Valuation = require('../models/Valuation');

exports.calculateAndSaveValuation = async (req, res) => {
    const { method, inputs } = req.body;

    if (!method || !inputs) {
        return res.status(400).json({ 
            message: 'Method and input factors are required.',
            success: false 
        });
    }

    let valuationResult = 0;
    let methodTitle = '';

    try {
        // --- 1. Call the appropriate service method based on input 'method' ---
        switch (method) {
            case 'berkus':
                valuationResult = valuationService.calculateBerkus(inputs);
                methodTitle = 'Berkus Method';
                break;

            case 'scorecard':
                valuationResult = valuationService.calculateScorecard(inputs);
                methodTitle = 'Scorecard Method';
                break;
                
            case 'dcf':
                valuationResult = valuationService.calculateDCF(inputs);
                methodTitle = 'Discounted Cash Flow (DCF)';
                break;

            case 'vc_method':
                valuationResult = valuationService.calculateVC(inputs);
                methodTitle = 'Venture Capital (VC) Method';
                break;

            default:
                return res.status(400).json({ 
                    message: `Invalid valuation method: ${method}`, 
                    success: false 
                });
        }

        // --- 2. Save the calculation result to the database (Using the imported Model) ---
        const newValuationRecord = new Valuation({
            method: methodTitle,
            inputs: inputs,
            result: valuationResult,
            calculatedAt: new Date()
        });
        await newValuationRecord.save();
        

        // --- 3. Return the result to the frontend ---
        return res.status(200).json({
            method: methodTitle,
            valuation: valuationResult, 
            success: true
        });

    } catch (error) {
        console.error(`Error calculating valuation for method ${method}:`, error);
        return res.status(500).json({ 
            message: 'Server error during calculation.',
            error: error.message,
            success: false
        });
    }
};