const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
const multer = require('multer');
const path = require('path');
const Application = require('../models/FounderApplication');

// --- EMAIL CONFIG ---
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// --- MULTER CONFIG (File Upload) ---
const storage = multer.diskStorage({
    destination: './uploads/', // Ensure this folder exists
    filename: function (req, file, cb) {
        cb(null, 'deck-' + Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 10000000 }, // 10MB Limit
    fileFilter: function (req, file, cb) {
        const filetypes = /pdf/;
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = filetypes.test(file.mimetype);
        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb('Error: PDFs Only!');
        }
    }
}).single('pitch_deck'); // Field name must match Frontend

// --- EMAIL SENDER ---
const sendEmail = async (to, subject, userName) => {
    const htmlContent = `
        <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #eee; line-height: 1.6; color: #333;">
            <p>Dear <strong>${userName}</strong>,</p>
            
            <p>Thank you for registering for the <strong>RAMP Program</strong>.</p>
            
            <p>We’re pleased to inform you that we have successfully received your application. Our screening team is currently reviewing all entries, and a member of our team will get in touch with you shortly regarding the next steps.</p>
            
            <p>We truly appreciate your interest and initiative in being part of the RAMP journey.</p>
            
            <p>All the best,<br><strong>Team RAMP</strong></p>
        </div>
    `;

    try {
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to,
            subject,
            html: htmlContent
        });
        console.log(`Email sent to ${to}`);
    } catch (err) {
        console.error("Email error:", err);
    }
};

// --- POST ROUTE ---
router.post('/', (req, res) => {
    upload(req, res, async (err) => {
        if (err) return res.status(400).json({ success: false, message: err });

        try {
            if (!req.file) return res.status(400).json({ success: false, message: "Please upload your Pitch Deck PDF." });

            // Extract text fields
            const { email, brand_name, legal_name, founded_date, brief, domain, stage, website, linkedin } = req.body;

            // Validate
            if (!email || !brand_name) {
                return res.status(400).json({ success: false, message: "Missing required fields." });
            }

            // Save to DB
            const newApp = new Application({
                email, brand_name, legal_name, founded_date, brief, domain, stage, website, linkedin,
                pitch_deck: req.file.path // Save file path
            });

            await newApp.save();

            // Send Email
            await sendEmail(email, "Your RAMP Application has been received.", brand_name);

            res.status(201).json({ success: true, message: "Submitted successfully!", id: newApp._id });

        } catch (error) {
            res.status(500).json({ success: false, message: "Server Error", error: error.message });
        }
    });
});

module.exports = router;