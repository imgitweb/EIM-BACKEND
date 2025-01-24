const User = require("./../models/userModel"); // Import User model

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
