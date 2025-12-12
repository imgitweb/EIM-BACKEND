const Captable = require("../models/Captable");

const getCaptable = async (req, res) => {
  try {
    const captable = await Captable.findOne();
    res.json({ success: true, captable });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

const saveCaptable = async (req, res) => {
  try {
    const data = req.body;
    let captable = await Captable.findOne();

    if (!captable) {
      captable = await Captable.create(data);
      return res.json({ success: true, message: "Captable created", captable });
    }

    captable = await Captable.findOneAndUpdate({}, data, { new: true });
    res.json({ success: true, message: "Captable updated", captable });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

module.exports = { getCaptable, saveCaptable };