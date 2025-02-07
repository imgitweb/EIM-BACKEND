// controllers/investorController.js
const Investor = require('../models/InvestorModel');


function safeParseJSON(str) {
    try {
        return JSON.parse(str);
    } catch (e) {
        console.error('Error parsing JSON:', e);
        return [];
    }
}
// controllers/investorController.js
exports.addInvestor = async (req, res) => {
    try {
        console.log('Received body:', req.body);

        // Safely parse the skills array from the form data
        const skills = safeParseJSON(req.body.skills || '[]');
        console.log('Parsed skills:', skills);

        const investorData = {
            ...req.body,
            skills: skills
        };

        console.log('Final investor data:', investorData);

        if (req.file && req.body.investorType === 'vc') {
            investorData.firmLogo = `uploads/investors/${req.file.filename}`;
        }

        const investor = new Investor(investorData);
        await investor.save();

        res.status(201).json({
            success: true,
            data: investor
        });
    } catch (error) {
        console.error('Detailed error:', error);
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                error: 'An investor with this email already exists'
            });
        }

        res.status(500).json({
            success: false,
            error: error.message || 'Server Error'
        });
    }
};

exports.getInvestors = async (req, res) => {
    try {
        const { sort, industry, stage } = req.query;
        let query = { isDeleted: false };

        // Add filters if provided
        if (industry && industry !== 'industry-agnostic') {
            query.industry = industry.toLowerCase();
        }
        if (stage && stage !== 'stage-agnostic') {
            query.stage = stage.toLowerCase();
        }

        // Build sort object
        let sortObj = {};
        if (sort) {
            const [field, order] = sort.split(':');
            sortObj[field] = order === 'desc' ? -1 : 1;
        } else {
            sortObj = { createdAt: -1 }; // Default sort by newest
        }

        const investors = await Investor.find(query)
            .sort(sortObj)
            .select('-__v -isDeleted -deletedAt');

        res.status(200).json({
            success: true,
            count: investors.length,
            data: investors
        });
    } catch (error) {
        console.error('Error fetching investors:', error);
        res.status(500).json({
            success: false,
            error: 'Server Error'
        });
    }
};

// Get all angel investors
exports.getAngelInvestors = async (req, res) => {
    try {
        const { sort, industry, stage } = req.query;
        let query = {
            isDeleted: false,
            investorType: 'angel'
        };

        if (industry && industry !== 'industry-agnostic') {
            query.industry = industry.toLowerCase();
        }
        if (stage && stage !== 'stage-agnostic') {
            query.stage = stage.toLowerCase();
        }

        let sortObj = sort ?
            { [sort.split(':')[0]]: sort.split(':')[1] === 'desc' ? -1 : 1 } :
            { createdAt: -1 };

        const investors = await Investor.find(query)
            .sort(sortObj)
            .select('-__v -isDeleted -deletedAt'); // Make sure 'skills' isn't being excluded

        res.status(200).json({
            success: true,
            count: investors.length,
            data: investors
        });
    } catch (error) {
        console.error('Error fetching angel investors:', error);
        res.status(500).json({
            success: false,
            error: 'Server Error'
        });
    }
};

// Get all VC investors
exports.getVCInvestors = async (req, res) => {
    try {
        const { sort, industry, stage } = req.query;
        let query = {
            isDeleted: false,
            investorType: 'vc'
        };

        if (industry && industry !== 'industry-agnostic') {
            query.industry = industry.toLowerCase();
        }
        if (stage && stage !== 'stage-agnostic') {
            query.stage = stage.toLowerCase();
        }

        let sortObj = sort ?
            { [sort.split(':')[0]]: sort.split(':')[1] === 'desc' ? -1 : 1 } :
            { createdAt: -1 };

        const investors = await Investor.find(query)
            .sort(sortObj)
            .select('-__v -isDeleted -deletedAt');

        res.status(200).json({
            success: true,
            count: investors.length,
            data: investors
        });
    } catch (error) {
        console.error('Error fetching VC investors:', error);
        res.status(500).json({
            success: false,
            error: 'Server Error'
        });
    }
};

exports.getInvestor = async (req, res) => {
    try {
        const investor = await Investor.findOne({
            _id: req.params.id,
            isDeleted: false
        }).select('-__v -isDeleted -deletedAt');

        if (!investor) {
            return res.status(404).json({
                success: false,
                error: 'Investor not found'
            });
        }

        res.status(200).json({
            success: true,
            data: investor
        });
    } catch (error) {
        console.error('Error fetching investor:', error);
        if (error.name === 'CastError') {
            return res.status(400).json({
                success: false,
                error: 'Invalid investor ID'
            });
        }
        res.status(500).json({
            success: false,
            error: 'Server Error'
        });
    }
};

exports.updateInvestor = async (req, res) => {
    try {
        console.log('Received body:', req.body);

        // Safely parse skills if they're being updated
        let skills = safeParseJSON(req.body.skills || '[]');
        console.log('Parsed skills:', skills);

        let updateData = {
            ...req.body,
            skills: skills
        };

        // If a new logo was uploaded for VC
        if (req.file && updateData.investorType === 'vc') {
            updateData.firmLogo = `uploads/investors/${req.file.filename}`;
        }

        const investor = await Investor.findOneAndUpdate(
            {
                _id: req.params.id,
                isDeleted: false
            },
            updateData,
            {
                new: true,
                runValidators: true
            }
        ).select('-__v -isDeleted -deletedAt');

        if (!investor) {
            return res.status(404).json({
                success: false,
                error: 'Investor not found'
            });
        }

        res.status(200).json({
            success: true,
            data: investor
        });
    } catch (error) {
        console.error('Error updating investor:', error);
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                error: 'An investor with this email already exists'
            });
        }
        if (error.name === 'CastError') {
            return res.status(400).json({
                success: false,
                error: 'Invalid investor ID'
            });
        }
        res.status(500).json({
            success: false,
            error: error.message || 'Server Error'
        });
    }
};

exports.deleteInvestor = async (req, res) => {
    try {
        const investorId = req.params.id; // Get the ID directly

        // Find the investor and update the isDeleted flag
        const updatedInvestor = await Investor.findByIdAndUpdate(
            investorId,
            { isDeleted: true, deletedAt: new Date() },
            { new: true, runValidators: true } // Important: Return updated document
        );

        if (!updatedInvestor) {
            return res.status(404).json({ success: false, error: 'Investor not found or already deleted' });
        }

        // Respond with 204 No Content on successful delete
        res.status(204).json(); // No body needed for 204

    } catch (error) {
        console.error('Error deleting investor:', error);

        if (error.name === 'CastError') {
            return res.status(400).json({ success: false, error: 'Invalid investor ID' });
        }

        res.status(500).json({ success: false, error: 'Server error during delete' });
    }
};

