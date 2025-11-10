const express = require("express");
const {
  getAllDeliverables,
  markAsComplete,
} = require("../../controller/DeliverableController/deliverableController");

const router = express.Router();

module.exports.DeliverableRoutes = (upload) => {
  if (!upload) console.error("UPLOAD IS UNDEFINED!");

  router.post("/get-all", getAllDeliverables);

  router.post(
    "/mark-as-completed",
    upload.single("screenshot"),
    (req, res, next) => {
      console.log("MULTER DEBUG req.body:", req.body);
      console.log("MULTER DEBUG req.file:", req.file);
      next();
    },
    markAsComplete
  );

  return router;
};
