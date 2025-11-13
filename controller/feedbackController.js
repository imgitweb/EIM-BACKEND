const feedbackModel = require("../models/feedbackModel");

const getFeedback = async (req, res) => {
  try {
    const { startup_id } = req.query; 

    const filter = startup_id ? { startup_id } : {};

    const feedback = await feedbackModel.find(filter).sort({ createdAt: -1 });

    res.status(200).json({ success: true, feedback });
  } catch (error) {
    console.error("Error fetching feedback:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

const addFeedback = async (req, res) => {
  try {
    const { category, comment, user, startup_id } = req.body;

    if (!comment || !user || !startup_id) {
      return res.status(400).json({
        success: false,
        message: "User, comment, and startup_id are required",
      });
    }

    const newFeedback = await feedbackModel.create({
      category,
      comment,
      user,
      startup_id,
      date: new Date().toISOString().split("T")[0],
      status: "New",
    });

    res.status(201).json({
      success: true,
      message: "Feedback added successfully",
      feedback: newFeedback,
    });
  } catch (error) {
    console.error("Error adding feedback:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

const updateFeedbackStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res
        .status(400)
        .json({ success: false, message: "Status is required" });
    }

    const updatedFeedback = await feedbackModel.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!updatedFeedback) {
      return res
        .status(404)
        .json({ success: false, message: "Feedback not found" });
    }

    res.status(200).json({
      success: true,
      message: "Feedback status updated successfully",
      feedback: updatedFeedback,
    });
  } catch (error) {
    console.error("Error updating feedback:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

const deleteFeedback = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await feedbackModel.findByIdAndDelete(id);

    if (!deleted) {
      return res
        .status(404)
        .json({ success: false, message: "Feedback not found" });
    }

    res.status(200).json({
      success: true,
      message: "Feedback deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting feedback:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

module.exports = {
  getFeedback,
  addFeedback,
  updateFeedbackStatus,
  deleteFeedback,
};
