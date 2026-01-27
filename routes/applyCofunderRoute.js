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
        user: "risejhansi.ramp@gmail.com",
        pass: "mhdc jduc hdiq zgnj",
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
    <div style="background-color: #f9f9f9; padding: 40px 20px; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;">
        <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 8px; border-top: 4px solid #2563eb; box-shadow: 0 4px 6px rgba(0,0,0,0.05); overflow: hidden;">
            
            <div style="padding: 40px; color: #1f2937;">
                <h2 style="margin-top: 0; color: #111827; font-size: 20px; font-weight: 600;">Application Received</h2>
                
                <p style="margin-bottom: 24px;">Dear <strong>${userName}</strong>,</p>
                
                <p style="line-height: 1.7; margin-bottom: 16px;">
                    Thank you for registering for the <strong>RAMP Program</strong>. We have successfully received your application.
                </p>
                
                <p style="line-height: 1.7; margin-bottom: 24px;">
                    Our screening team is currently reviewing your profile. A member of our team will contact you shortly regarding the next steps in the selection process.
                </p>
                
                <p style="line-height: 1.7; margin-bottom: 32px;">
                    We appreciate your interest in the RAMP journey and look forward to potentially working with you.
                </p>
                
                <hr style="border: 0; border-top: 1px solid #e5e7eb; margin-bottom: 24px;">
                
                <p style="margin: 0; color: #6b7280; font-size: 14px;">
                    Best regards,<br>
                    <strong style="color: #111827;">Team RAMP</strong>
                </p>
            </div>
            
            <div style="background-color: #f3f4f6; padding: 20px; text-align: center; font-size: 12px; color: #9ca3af;">
                This is an automated notification regarding your program registration.
            </div>
        </div>
    </div>
`;

    try {
        await transporter.sendMail({
            from: '"Team RAMP" <risejhansi.ramp@gmail.com>',
            to,
            cc: "imcktiwari@gmail.com",
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