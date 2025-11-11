const Compliance = require('../models/Compliance');
const multer = require('multer');
const path = require('path');

// Multer config (store in uploads/)
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${file.fieldname}${ext}`);
  },
});
const upload = multer({ storage });

// CREATE
exports.createCompliance = [
  upload.array('attachments', 10),
  async (req, res) => {
    try {
      const files = req.files ? req.files.map(f => f.path) : [];
      const data = { ...req.body, attachments: files };
      const compliance = await Compliance.create(data);
      res.status(201).json(compliance);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
];

// READ ALL
exports.getAllCompliances = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const total = await Compliance.countDocuments();
    const compliances = await Compliance.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json({ data: compliances, total, page, limit });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// UPDATE
exports.updateCompliance = [
  upload.array('attachments', 10),
  async (req, res) => {
    try {
      const { id } = req.params;
      const files = req.files ? req.files.map(f => f.path) : [];
      const updateData = { ...req.body };
      if (files.length) updateData.attachments = files;

      const compliance = await Compliance.findByIdAndUpdate(id, updateData, {
        new: true,
      });
      if (!compliance) return res.status(404).json({ error: 'Not found' });
      res.json(compliance);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
];

exports.deleteCompliance = async (req, res) => {
  try {
    const { id } = req.params;
    const compliance = await Compliance.findByIdAndDelete(id);
    if (!compliance) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};