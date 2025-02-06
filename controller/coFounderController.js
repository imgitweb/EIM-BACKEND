// coFounderController.js
const CoFounder = require('../models/CoFounder');
const fs = require('fs');
const path = require('path');

// Add a new co-founder
exports.addCoFounder = async (req, res) => {
    try {
        const { coFounderName, skills, location, typeOfCoFounder, industry, weeklyAvailability, startupStage } = req.body;
        const profilePhoto = req.file ? req.file.path : null;

        if (!profilePhoto) {
            return res.status(400).json({ error: 'Profile photo is required' });
        }

        const newCoFounder = new CoFounder({
            coFounderName,
            profilePhoto,
            skills,
            location,
            typeOfCoFounder,
            industry,
            weeklyAvailability,
            startupStage,
        });

        await newCoFounder.save();
        res.status(201).json({ success: true, message: 'Co-founder added successfully', data: newCoFounder });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'An error occurred while adding the co-founder' });
    }
};

// Get all co-founders
exports.getAllCoFounders = async (req, res) => {
    try {
        const coFounders = await CoFounder.find({ isDeleted: { $ne: true } }).sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: coFounders });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'An error occurred while fetching co-founders' });
    }
};

// Update cofounder
exports.updateCofounder = async (req, res) => {
    try {
        const cofounder = await CoFounder.findById(req.params.id);
        if (!cofounder) {
            return res.status(404).json({
                status: 'error',
                message: 'Cofounder not found'
            });
        }

        const updatedCofounder = await CoFounder.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );

        res.json({
            status: 'success',
            data: updatedCofounder
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
};

// Delete cofounder
exports.deleteCofounder = async (req, res) => {
    try {
        const cofounder = await CoFounder.findById(req.params.id);
        if (!cofounder) {
            return res.status(404).json({
                status: 'error',
                message: 'Cofounder not found'
            });
        }

        // Soft delete by setting isDeleted to true
        const deletedCofounder = await CoFounder.findByIdAndUpdate(
            req.params.id,
            { isDeleted: true },
            { new: true }
        );

        res.json({
            status: 'success',
            data: deletedCofounder
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
};