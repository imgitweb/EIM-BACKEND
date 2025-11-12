const Partner = require('../../models/partners/Partners');
const sendConnectionEmail = require('../../utils/sendConnectionEmail');
const Connection = require('../../models/Connection'); // You'll need to create this model

// Create a new partner
exports.createPartner = async (req, res) => {
  try {
    const {
      name,
      designation,
      companyName,
      contactNumber,
      email,
      linkedinUrl,
      location,
      partnerType,
      imageUrl,
      industry,
      websiteUrl,
      description
    } = req.body;
    console.log("Received partner data:", req.body); 

    // Basic validation for required fields
    if (!name || !email || !partnerType ) {
      return res.status(400).json({ message: "Name, Email, and Partner Type are required." });
    }

    const partner = new Partner({
      name,
      designation,
      companyName,
      contactNumber,
      email,
      linkedinUrl,
      location,
      partnerType,
      imageUrl,
      industry,
      websiteUrl,
      description
    });

    const savedPartner = await partner.save();
    res.status(201).json(savedPartner);
  } catch (error) {
    // Handle duplicate email error
    if (error.code === 11000) {
      return res.status(400).json({ message: "Email already exists." });
    }
    res.status(500).json({ message: error.message });
  }
};

// Get all partners
exports.getAllPartners = async (req, res) => {
  try {
    const partners = await Partner.find();
    res.status(200).json(partners);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get a single partner by ID
exports.getPartnerById = async (req, res) => {
  try {
    const partner = await Partner.findById(req.params.id);
    if (!partner) {
      return res.status(404).json({ message: 'Partner not found' });
    }
    res.status(200).json(partner);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update a partner by ID
exports.updatePartner = async (req, res) => {
  try {
    const updatedPartner = await Partner.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!updatedPartner) {
      return res.status(404).json({ message: 'Partner not found' });
    }
    res.status(200).json(updatedPartner);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete a partner by ID
exports.deletePartner = async (req, res) => {
  try {
    const deletedPartner = await Partner.findByIdAndDelete(req.params.id);
    if (!deletedPartner) {
      return res.status(404).json({ message: 'Partner not found' });
    }
    res.status(200).json({ message: 'Partner deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ FIXED: Connect user with partner - Save to database and send email
exports.connectLegalPartner = async (req, res) => {
  try {
    const { 
      partnerId, 
      partnerEmail, 
      name,           // User's name
      email,          // User's email
      phone,          // User's phone
      company,        // User's company
      message         // Connection message
    } = req.body;
    
    console.log("Connect request received:", req.body);

    // ✅ Validate required fields
    if (!partnerId) {
      return res.status(400).json({ message: "Partner ID is required." });
    }

    if (!name || !email || !phone || !message) {
      return res.status(400).json({ 
        message: "Name, Email, Phone, and Message are required." 
      });
    }

    // ✅ Verify partner exists
    const partner = await Partner.findById(partnerId);
    if (!partner) {
      return res.status(404).json({ message: "Partner not found." });
    }

    // ✅ Create connection record in database
    const connection = new Connection({
      partnerId: partnerId,
      partnerName: partner.name,
      partnerEmail: partner.email,
      userName: name,
      userEmail: email,
      userPhone: phone,
      userCompany: company || "Not provided",
      message: message,
      status: "pending",
      createdAt: new Date()
    });

    const savedConnection = await connection.save();
    console.log("Connection saved:", savedConnection);

    // ✅ Send emails to both parties
    try {
      // Email to user
      await sendConnectionEmail(
        email, 
        "user", 
        name, 
        partner.name,
        partner.email,
        message
      );

      // Email to partner
      await sendConnectionEmail(
        partnerEmail, 
        "partner", 
        name, 
        partner.name,
        email,
        message
      );
      console.log("Emails sent successfully");
    } catch (emailError) {
      console.error("Email sending error:", emailError);
      // Don't fail the request if email fails
    }

    res.status(201).json({ 
      message: `Connection request sent successfully to ${partner.name}. They will contact you soon.`,
      connectionId: savedConnection._id
    });

  } catch (error) {
    console.error("Connection error:", error);
    res.status(500).json({ 
      message: error.message || "Error creating connection request." 
    });
  }
};