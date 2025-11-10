const express = require("express");
const router = express.Router();
const {
  createTermSheet,
  getMyTermSheets,
  getTermSheetById,
  downloadTermSheetPdf,
} = require("../controller/termSheetController");
const { protect } = require("../middleware/authMiddleware");

router.use(protect);

router.route("/").post(createTermSheet).get(getMyTermSheets);
router.route("/:id").get(getTermSheetById);
router.get("/:id/download", downloadTermSheetPdf);

module.exports = router;