const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Application = require('../models/FounderApplication');

const uploadDir = './uploads/cofounder';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: "risejhansi.ramp@gmail.com",
        pass: "mhdc jduc hdiq zgnj",
    }
});

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'deck-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const filetypes = /pdf/;
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = filetypes.test(file.mimetype);
        if (mimetype && extname) {
            return cb(null, true);
        }
        cb(new Error('Only PDF files are allowed!'));
    }
}).single('pitch_deck');

const sendEmail = async (to, subject, userName) => {
    const htmlContent = `
    <div style="background-color: #f9f9f9; padding: 40px 20px; font-family: Arial, sans-serif;">
        <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-top: 4px solid #2563eb; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
            <div style="padding: 40px; color: #1f2937;">
                <h2 style="margin-top: 0; color: #111827;">Application Received</h2>
                <p>Dear <strong>${userName}</strong>,</p>
                <p>Thank you for registering for the <strong>RAMP Program</strong>. We have successfully received your application.</p>
                <p>Our screening team is currently reviewing your profile. We will contact you shortly regarding the next steps.</p>
                <hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 24px 0;">
                <p style="font-size: 14px; color: #6b7280;">Best regards,<br><strong style="color: #111827;">Team RAMP</strong></p>
            </div>
        </div>
    </div>`;

    try {
        await transporter.sendMail({
            from: '"Team RAMP" <risejhansi.ramp@gmail.com>',
            to,
            cc: "imcktiwari@gmail.com",
            subject,
            html: htmlContent
        });
    } catch (err) {
        console.error("Email error:", err);
    }
};

router.post('/', (req, res) => {
    upload(req, res, async (err) => {
        if (err) {
            return res.status(400).json({ success: false, message: err.message });
        }

        try {
            if (!req.file) {
                return res.status(400).json({ success: false, message: "Please upload your Pitch Deck PDF." });
            }

            const { email, brand_name, phone_no, founded_date, brief, domain, stage, website, linkedin } = req.body;

            if (!email || !brand_name) {
                if (req.file) fs.unlinkSync(req.file.path);
                return res.status(400).json({ success: false, message: "Missing required fields." });
            }

            const newApp = new Application({
                email, brand_name, phone_no, founded_date, brief, domain, stage, website, linkedin,
                pitch_deck: req.file.path
            });

            await newApp.save();

            sendEmail(email, "Your RAMP Application has been received.", brand_name);

            res.status(201).json({ success: true, message: "Submitted successfully!", id: newApp._id });

        } catch (error) {
            if (req.file) fs.unlinkSync(req.file.path);
            res.status(500).json({ success: false, message: "Server Error", error: error.message });
        }
    });
});

module.exports = router;