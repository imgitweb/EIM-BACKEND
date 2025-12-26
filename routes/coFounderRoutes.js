// coFounderRoutes.js
const express = require("express");
const router = express.Router();
const {
  addCoFounder,
  getAllCoFounders,
  updateCofounder,
  deleteCofounder,
  getCoFounderById,
} = require("../controller/coFounderController");

module.exports = (upload) => {
  router.post("/", upload.single("profilePhoto"), addCoFounder);
  router.get("/", getAllCoFounders);
  router.get("/:id", getCoFounderById);
  router.put("/:id", updateCofounder);
  router.delete("/:id", deleteCofounder);
  return router;
};
