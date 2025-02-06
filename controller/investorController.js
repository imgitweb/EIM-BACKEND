// controllers/investorController.js
const Investor = require('../models/InvestorModel');

exports.addInvestor = async (req, res) => {
    try {
        const investorData = { ...req.body };
        
        // Create image URL for VC firms
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
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                error: 'An investor with this email already exists'
            });
        }

        res.status(500).json({
            success: false,
            error: 'Server Error'
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
            .select('-__v -isDeleted -deletedAt');

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
        let updateData = { ...req.body };

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
            error: 'Server Error'
        });
    }
};

exports.deleteInvestor = async (req, res) => {
    try {
        const investor = await Investor.findOneAndUpdate(
            {
                _id: req.params.id,
                isDeleted: false
            },
            {
                isDeleted: true,
                deletedAt: new Date()
            },
            {
                new: true,
                runValidators: true
            }
        );

        if (!investor) {
            return res.status(404).json({
                success: false,
                error: 'Investor not found or already deleted'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Investor successfully deleted',
            data: {}
        });
    } catch (error) {
        console.error('Error deleting investor:', error);
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
