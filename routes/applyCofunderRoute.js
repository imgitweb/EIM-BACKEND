const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
const Application = require('../models/FounderApplication');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

transporter.verify((error, success) => {
    if (error) {
        console.log(error);
    } else {
        console.log("Email Server Ready");
    }
});

const sendEmail = async (to, subject, userName, statusUpdate = false) => {
    let htmlContent = '';

    if (statusUpdate) {
        htmlContent = `
            <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #eee;">
                <h2 style="color: #ff2020;">Status Update</h2>
                <p>Hello <strong>${userName}</strong>,</p>
                <p>Your application status has been updated to <strong>Shortlisted</strong>.</p>
                <p>Regards,<br>RISE Jhansi</p>
            </div>
        `;
    } else {
        htmlContent = `
            <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #eee;">
                <h2 style="color: #ff2020;">Application Received</h2>
                <p>Hello <strong>${userName}</strong>,</p>
                <p>Thank you for applying to RAMP. We have received your details.</p>
                <p>Regards,<br>RISE Jhansi</p>
            </div>
        `;
    }

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

router.post('/', async (req, res) => {
    try {
        const { email, brand_name, legal_name, founded_date, brief, domain, stage, website, linkedin, pitch_deck } = req.body;

        if (!email || !brand_name || !pitch_deck) {
            return res.status(400).json({ success: false, message: "Missing required fields." });
        }

        const newApp = new Application({
            email, brand_name, legal_name, founded_date,
            brief, domain, stage, website, linkedin, pitch_deck
        });

        await newApp.save();

        await sendEmail(email, "Application Received - RAMP", brand_name);

        res.status(201).json({ success: true, message: "Submitted successfully!", id: newApp._id });

    } catch (error) {
        res.status(500).json({ success: false, message: "Server Error", error: error.message });
    }
});

router.get('/', async (req, res) => {
    try {
        const { id, status } = req.query;
        let query = {};

        if (id) query._id = id;
        if (status) query.status = status;

        const apps = await Application.find(query).sort({ applied_at: -1 });

        res.status(200).json({ success: true, count: apps.length, data: apps });

    } catch (error) {
        res.status(500).json({ success: false, message: "Fetch Error", error: error.message });
    }
});

router.patch('/update-status/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const validStatuses = ['Pending', 'Shortlisted', 'Rejected', 'Interview'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ success: false, message: "Invalid status." });
        }

        const updatedApp = await Application.findByIdAndUpdate(
            id,
            { status: status },
            { new: true }
        );

        if (!updatedApp) {
            return res.status(404).json({ success: false, message: "Application not found." });
        }

        if (status === 'Shortlisted') {
            await sendEmail(updatedApp.email, "Application Shortlisted", updatedApp.brand_name, true);
        }

        res.status(200).json({ success: true, message: `Status updated to ${status}`, data: updatedApp });

    } catch (error) {
        res.status(500).json({ success: false, message: "Update Error", error: error.message });
    }
});

module.exports = router;