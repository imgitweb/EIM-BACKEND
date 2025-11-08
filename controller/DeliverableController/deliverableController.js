const {
  deliverableModel,
} = require("../../models/DeliverablesModel/deliverables");

async function getAllDeliverables(req, res) {
  try {
    const { startup_id } = req.body;
    const deliverables = await deliverableModel
      .find({
        startup_id: startup_id,
        is_deleted: false,
      })
      .lean();
    if (!deliverables) {
      console.log("0️⃣ deliverables found for this user");
      return res.status(404).json({
        message: `0️⃣ deliverables found for ${startup_id}`,
        success: false,
      });
    }
    return res.status(200).json({
      message: "Deliverables found for user",
      success: true,
      data: deliverables,
      length: deliverables.length,
    });
  } catch (error) {
    console.error("❌ Something went wrong");
    return res.status(500).json({
      message: "Something went wrong while fetching the deliverables",
      success: false,
    });
  }
}

async function markDeliverableDone(req, res) {
  try {
    console.log("req body", req.body);
    console.log("File Location", req.file);
    const { id, remarks, details } = req.body;
    const screenshot = req.file ? req.file.path : null;

    if (!id) {
      return res.status(400).json({
        message: "Deliverable ID is required",
        success: false,
      });
    }

    const updateDeliverable = await deliverableModel.findOneAndUpdate(
      { _id: id },
      {
        $set: {
          file_location: screenshot,
          is_completed: true,
          completed_at: new Date(),
          remark: remarks,
        },
      },
      { new: true }
    );

    if (!updateDeliverable) {
      return res.status(404).json({
        message: "Deliverable not found",
        success: false,
      });
    }

    return res.status(200).json({
      message: "Deliverable marked as done successfully!",
      success: true,
      deliverable: updateDeliverable,
    });
  } catch (error) {
    console.error("☠️ Something went wrong :", error);
    return res.status(500).json({
      message: "Something went wrong ☠️",
      success: false,
    });
  }
}

module.exports.getAllDeliverables = getAllDeliverables;
module.exports.markAsComplete = markDeliverableDone;
