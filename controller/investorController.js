const Investor = require('../models/InvestorModel');

// Add new investor
exports.addInvestor = async (req, res) => {
    try {
        const {
            companyName,
            founderName,
            email,
            website,
            aboutUs,
            idealFor,
            industry
        } = req.body;

        // Create image URL
        const companyLogo = `/uploads/investors/${req.file.filename}`;

        const investor = new Investor({
            companyName,
            founderName,
            companyLogo,
            email,
            website,
            aboutUs,
            idealFor,
            industry
        });

        await investor.save();

        res.status(201).json({
            success: true,
            data: investor
        });
    } catch (error) {
        if (error.code === 11000) { // Duplicate key error
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

// Get all investors
exports.getInvestors = async (req, res) => {
    try {
        const { sort, industry, idealFor } = req.query;
        let query = {};

        // Add filters if provided
        if (industry) {
            query.industry = industry.toLowerCase();
        }
        if (idealFor) {
            query.idealFor = idealFor.toLowerCase();
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
            .select('-__v'); // Exclude version key

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

// Get single investor by ID
exports.getInvestor = async (req, res) => {
    try {
        const investor = await Investor.findById(req.params.id)
            .select('-__v');

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
        res.status(500).json({
            success: false,
            error: 'Server Error'
        });
    }
};