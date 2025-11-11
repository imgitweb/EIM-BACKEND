const Productlist = require("../../models/sales/productList");
const ProductPricing = require("../../models/sales/productPricing");
const MarketingFunnel = require("../../models/sales/marketingFunnel");
const SalesFunnelLead = require("../../models/sales/salesFunnelLead");

module.exports.getProduct = async (req, res) => {
  try {
    const { startupId } = req.query; // e.g., /api/product/:startupId

    const products = await Productlist.find({ startupId });

    if (!products || products.length === 0) {
      return res.status(404).json({
        status: false,
        message: "No products found for this startup",
      });
    }

    res.json({
      status: true,
      message: "Products fetched successfully",
      data: products,
    });
  } catch (error) {
    res.status(500).json({ status: false, message: error.message });
  }
};

module.exports.createProduct = async (req, res) => {
  try {
    const { startupId, name, category, price } = req.body;
    if (!startupId || !name || !category || !price) {
      return res
        .status(400)
        .json({ status: false, message: "All fields are required!" });
    }
    const newProduct = new Productlist({ startupId, name, category, price });
    const savedProduct = await newProduct.save();
    res.status(201).json({
      status: true,
      message: "Product created successfully",
      data: savedProduct,
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: "Internal server error",
      err: error.message,
    });
  }
};

module.exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params; // get id from URL
    const product = await Productlist.findById(id);
    if (!product) {
      return res
        .status(404)
        .json({ status: false, message: "Product not found" });
    }
    await product.deleteOne();
    res.json({ status: true, message: "Product removed", id });
  } catch (error) {
    res.status(500).json({ status: false, message: error.message });
  }
};

module.exports.submitProductPricing = async (req, res) => {
  try {
    const { startupId, fullName, email, phoneNumber, purpose, message } =
      req.body;

    const errors = {};

    if (!fullName?.trim()) errors.fullName = "Full name required";
    if (!email?.trim()) errors.email = "Email required";
    else if (!/^\S+@\S+\.\S+$/.test(email))
      errors.email = "Invalid email format";

    if (phoneNumber && !/^\d{10}$/.test(phoneNumber))
      errors.phoneNumber = "Phone must be 10 digits";

    if (!purpose) errors.purpose = "Please select a purpose";
    if (!message?.trim()) errors.message = "Message is required";

    if (Object.keys(errors).length > 0) {
      return res.status(400).json({ success: false, errors });
    }

    // Save to DB
    const entry = await ProductPricing.create({
      startupId,
      fullName: fullName.trim(),
      email: email.trim().toLowerCase(),
      phoneNumber: phoneNumber || null,
      purpose,
      message: message.trim(),
    });

    res.status(201).json({
      success: true,
      message: "Submitted successfully!",
      data: entry,
    });
  } catch (error) {
    console.error("ProductPricing Submit Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error. Please try again later.",
    });
  }
};
module.exports.submitMarketingFunnel = async (req, res) => {
  try {
    const { startupId, fullName, email, phoneNumber, purpose, message } =
      req.body;

    const errors = {};

    if (!fullName?.trim()) errors.fullName = "Full name is required";
    if (!email?.trim()) errors.email = "Email is required";
    else if (!/^\S+@\S+\.\S+$/.test(email))
      errors.email = "Invalid email format";

    if (phoneNumber && !/^\d{10}$/.test(phoneNumber))
      errors.phoneNumber = "Phone must be 10 digits";

    if (!purpose) errors.purpose = "Please select a purpose";
    if (!message?.trim()) errors.message = "Message is required";

    if (Object.keys(errors).length > 0) {
      return res.status(400).json({ success: false, errors });
    }

    const entry = await MarketingFunnel.create({
      startupId,
      fullName: fullName.trim(),
      email: email.trim().toLowerCase(),
      phoneNumber: phoneNumber || null,
      purpose,
      message: message.trim(),
    });

    res.status(201).json({
      success: true,
      message: "Submitted successfully!",
      data: entry,
    });
  } catch (error) {
    console.error("MarketingFunnel Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error. Try again later.",
    });
  }
};

module.exports.submitSalesFunnelLead = async (req, res) => {
  try {
    const { startupId, fullName, email, phoneNumber, interest, budget, notes } =
      req.body;

    const errors = {};

    if (!fullName?.trim()) errors.fullName = "Full Name is required";
    if (!email?.trim()) errors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      errors.email = "Enter a valid email address";

    if (!phoneNumber?.trim()) errors.phoneNumber = "Phone Number is required";
    else if (!/^\d{10}$/.test(phoneNumber))
      errors.phoneNumber = "Enter a valid 10-digit phone number";

    if (!interest) errors.interest = "Please select an interest";
    if (!budget) errors.budget = "Please select a budget";

    if (Object.keys(errors).length > 0) {
      return res.status(400).json({ success: false, errors });
    }

    const lead = await SalesFunnelLead.create({
      startupId,
      fullName: fullName.trim(),
      email: email.trim().toLowerCase(),
      phoneNumber,
      interest,
      budget,
      notes: notes?.trim() || "",
    });

    res.status(201).json({
      success: true,
      message: "Sales Funnel lead saved successfully!",
      data: lead,
    });
  } catch (error) {
    console.error("SalesFunnel Lead Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error. Try again later.",
    });
  }
};
