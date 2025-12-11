const express = require("express");
const router = express.Router();
const {
  createTermSheet,
  getMyTermSheets,
  getTermSheetById,
  updateTermSheet,
  deleteTermSheet,
  downloadTermSheetPdf,
} = require("../controller/termSheetController");
const { protect } = require("../middleware/authMiddleware");


router.use(protect);


router.route("/")
  .post(createTermSheet)      
  .get(getMyTermSheets);     

router.get("/:id/download", downloadTermSheetPdf);

router
  .route("/:id")
  .get(getTermSheetById)     
  .put(updateTermSheet)     
  .delete(deleteTermSheet);  

module.exports = router;