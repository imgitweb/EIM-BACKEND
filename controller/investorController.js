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
        const companyLogo = `uploads/investors/${req.file.filename}`;

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
        let query = { isDeleted: false }; // Explicitly set isDeleted filter

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
            .select('-__v -isDeleted -deletedAt'); // Exclude unnecessary fields

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


// Update investor
exports.updateInvestor = async (req, res) => {
    try {
        let updateData = { ...req.body };

        // If idealFor or industry are provided, convert to lowercase
        if (updateData.idealFor) {
            updateData.idealFor = updateData.idealFor.toLowerCase();
        }
        if (updateData.industry) {
            updateData.industry = updateData.industry.toLowerCase();
        }

        // If a new logo was uploaded, add it to the update data
        if (req.file) {
            updateData.companyLogo = `/uploads/investors/${req.file.filename}`;
        }

        const investor = await Investor.findOneAndUpdate(
            {
                _id: req.params.id,
                isDeleted: false // Only update if not deleted
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
                isDeleted: false // Only update if not already deleted
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