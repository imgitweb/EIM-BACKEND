const User = require("./../models/userModel"); // Import User model
const mongoose = require("mongoose");
const nodemailer = require("nodemailer");
// Controller function to get 3 more users with the same industry
exports.getUsersByIndustry = async (req, res) => {
  try {
    const { industry } = req.params; // Get the industry from URL parameter

    // Find 3 users with the same industry
    const startup = await User.find({ industry: industry }).limit(3);

    if (!startup || startup.length === 0) {
      return res
        .status(404)
        .json({ message: "No users found with the specified industry." });
    }

    res.status(200).json(startup);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getStartupById = async (req, res) => {
  try {
    const startupId = req.params.id;

    console.log("Startup ID Received:", startupId);

    // Validate the ObjectId format
    if (!mongoose.Types.ObjectId.isValid(startupId)) {
      return res.status(400).json({ message: "Invalid ObjectId format" });
    }

    // Query the startup by ID
    const startup = await User.findOne({
      _id: new mongoose.Types.ObjectId(startupId),
    });

    console.log("Startup Found:", startup);

    if (!startup) {
      return res.status(404).json({ message: "Startup not found" });
    }

    // Find 3 more startups with the same industry
    const otherStartups = await User.find({
      industry: startup.industry,
      _id: { $ne: startup._id }, // Exclude the current startup
    }).limit(3); // Limit to 3 startups

    console.log("Other Startups in the same industry:", otherStartups);

    // Respond with the found startup and other startups in the same industry
    res.status(200).json({
      startup,
      otherStartups,
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.sendStartupExchangeEmail = async (req, res) => {
  try {
    // Destructure startup IDs from the request body
    const startupId1 = req.params.startupId1;
    const startupId2 = req.params.startupId2;

    console.log("Received startup IDs:", startupId1, startupId2);

    // Validate ObjectId format
    if (
      !mongoose.Types.ObjectId.isValid(startupId1) ||
      !mongoose.Types.ObjectId.isValid(startupId2)
    ) {
      return res.status(400).json({ message: "Invalid ObjectId format" });
    }

    // Find both startups by ID
    const startup1 = await User.findById(startupId1);
    const startup2 = await User.findById(startupId2);

    if (!startup1 || !startup2) {
      return res
        .status(404)
        .json({ message: "One or both startups not found" });
    }

    console.log("Startup 1 Found:", startup1);
    console.log("Startup 2 Found:", startup2);

    // Create the email transporter
    const transporter = nodemailer.createTransport({
      service: "gmail", // or your preferred email service
      auth: {
        user: "nitinjn07@gmail.com", // Your email address
        pass: "vyrf ohyr btpa gnoh", // Your email password (use environment variables for production)
      },
    });

    // Email message for startup 1 to receive startup 2's details
    const mailOptions1 = {
      from: "nitinjn07@gmail.com",
      to: startup1.email_id,
      subject: `Exchange Info with ${startup2.startup_name}`,
      text: `Hi ${startup1.startup_name},\n\nWe wanted to introduce you to ${startup2.startup_name}, a startup in the same industry. Here are their details:\n\n
        - Startup Name: ${startup2.startup_name}\n
        - Email: ${startup2.email_id}\n
        - Mobile: ${startup2.mobile_no}\n
        - Country: ${startup2.country_name}\n
        - Industry: ${startup2.industry}\n
        - City: ${startup2.city_name}\n
        - Startup Idea: ${startup2.startup_idea}\n\n
        Feel free to connect!\n\nBest Regards, Startup Exchange Team`,
    };

    // Email message for startup 2 to receive startup 1's details
    const mailOptions2 = {
      from: "nitinjn07@gmail.com",
      to: startup2.email_id,
      subject: `Exchange Info with ${startup1.startup_name}`,
      text: `Hi ${startup2.startup_name},\n\nWe wanted to introduce you to ${startup1.startup_name}, a startup in the same industry. Here are their details:\n\n
        - Startup Name: ${startup1.startup_name}\n
        - Email: ${startup1.email_id}\n
        - Mobile: ${startup1.mobile_no}\n
        - Country: ${startup1.country_name}\n
        - Industry: ${startup1.industry}\n
        - City: ${startup1.city_name}\n
        - Startup Idea: ${startup1.startup_idea}\n\n
        Feel free to connect!\n\nBest Regards, Startup Exchange Team`,
    };

    // Send emails to both startups
    await transporter.sendMail(mailOptions1);
    await transporter.sendMail(mailOptions2);

    // Respond with a success message
    res.status(200).json({
      message: `Emails sent successfully to ${startup1.startup_name} and ${startup2.startup_name}`,
    });
  } catch (error) {
    console.error("Error sending email:", error);
    res.status(500).json({ message: "Server error" });
  }
};
