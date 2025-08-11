
const PostCoFounder = require("../models/PostCoFounderModel");

const createPostCoFounder = async (req, res) => {
  try {
    const newEntry = new PostCoFounder(req.body);
    const saved = await newEntry.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const getAllPostCoFounders = async (req, res) => {
  try {
    const data = await PostCoFounder.find().sort({ createdAt: -1 });
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


module.exports = {
  createPostCoFounder,
  getAllPostCoFounders,
};
