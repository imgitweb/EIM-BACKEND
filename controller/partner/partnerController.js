const Partner = require('../../models/partners/Partners');


// Create a new partner
exports.createPartner = async (req, res) => {
  try {
    const {
      name,
      designation,
      companyName,
      contactNumber,
      email,
      linkedinProfile,
      location,
      partnerType,
      imageUrl,
      industry,
      websiteUrl,
      description
    } = req.body;
    console.log("Received partner data:", req.body); // Debug log


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
      linkedinProfile,
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


