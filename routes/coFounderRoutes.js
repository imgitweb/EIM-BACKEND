// coFounderRoutes.js
const express = require("express");
const router = express.Router();
const {
  addCoFounder,
  getAllCoFounders,
  updateCofounder,
  deleteCofounder,
  getCoFounderById,
  addOrUpdateFounders,
  uploadFoundersAgreement,
  getCoFounders,

} = require("../controller/coFounderController");

module.exports = (upload) => {
  router.post("/", upload.single("profilePhoto"), addCoFounder);


  // Add/Update founders text data
  router.post("/add-founders/:id", addOrUpdateFounders);

  // Upload Agreement PDF
  router.post(
    "/founders/upload-agreement/:id",
    upload.single("file"),
    uploadFoundersAgreement
  );

  router.get("/:id", getCoFounders);
  // router.get("/", getAllCoFounders);
  // router.get("/:id", getCoFounderById);
  router.put("/:id", updateCofounder);
  router.delete("/:id", deleteCofounder);
  return router;
};
