const express = require("express");
const {
  getFeedback,
  addFeedback,
  updateFeedbackStatus,
  deleteFeedback,
} = require("../controller/feedbackController");


const router = express.Router();

router.get("/", getFeedback);
router.post("/add", addFeedback);
router.put("/update/:id", updateFeedbackStatus);
router.delete("/delete/:id", deleteFeedback);

module.exports = router;
