const Funnel = require("../models/Funnel");

exports.getFunnelData = async (req, res) => {
  try {
    const funnelData = await Funnel.find();
    res.json(funnelData);
  } catch (err) {
    console.error("Error fetching funnel data:", err);
    res.status(500).json({ error: "Server Error" });
  }
};

exports.createFunnelData = async (req, res) => {
  try {
    const { name, category, price } = req.body;
    
    if (!name || !category || !price) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const newFunnel = new Funnel({
      name,
      category,
      price
    });

    const savedFunnel = await newFunnel.save();
    res.status(201).json(savedFunnel);
  } catch (err) {
    console.error("Error creating funnel data:", err);
    res.status(500).json({ error: "Server Error" });
  }
};