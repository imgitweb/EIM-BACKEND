const Scheme = require('../models/Scheme');

const getAllSchemes = async (req, res) => {
  try {
    const schemes = await Scheme.find({}).sort({ id: 1 });
    res.status(200).json(schemes);
  } catch (error) {
    console.error('Error fetching all schemes:', error);
    res.status(500).json({ message: error.message });
  }
};

const getSchemesByCategory = async (req, res) => {
  try {
    const category = req.params.category;
    let schemes;
    // Show all state-specific categories when frontend requests "state-government"
    if (category === 'state-government') {
      schemes = await Scheme.find({ category: { $regex: '^state-government', $options: 'i' } });
    } else {
      schemes = await Scheme.find({ category: category });
    }
    
    schemes = schemes.sort((a, b) => a.id - b.id);
    res.status(200).json(schemes);
  } catch (error) {
    console.error('Error fetching schemes by category:', error);
    res.status(500).json({ message: error.message });
  }
};

const getSchemeById = async (req, res) => {
  try {
    const scheme = await Scheme.findOne({ id: parseInt(req.params.id) });
    
    if (!scheme) {
      return res.status(404).json({ message: 'Scheme not found' });
    }
    
    res.status(200).json(scheme);
  } catch (error) {
    console.error('Error fetching scheme by ID:', error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAllSchemes,
  getSchemesByCategory,
  getSchemeById
};