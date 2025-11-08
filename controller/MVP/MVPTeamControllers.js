const MVPTeamModel = require("../../models/MVPTeamModel");

 const createCompany = async (req, res) => {
  try {
    const company = new MVPTeamModel(req.body);
    await company.save();
    res.status(201).json({ success: true, company });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

 const getCompanies = async (req, res) => {
  try {
    const { category, location, search } = req.query;

    const filter = {};

    if (category) filter.category = category;
    if (location) filter.location = location;
    if (search) filter.companyName = new RegExp(search, "i");

    const companies = await MVPTeamModel.find(filter);
    res.json({ success: true, companies });

  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};


 const updateCompany = async (req, res) => {
  try {
    const company = await MVPTeamModel.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, company });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

 const deleteCompany = async (req, res) => {
  try {
    await MVPTeamModel.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Company removed" });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

module.exports = {
  createCompany,
  getCompanies,
  updateCompany,
  deleteCompany,
};


