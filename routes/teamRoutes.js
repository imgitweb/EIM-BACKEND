const express = require("express");
const multer = require("multer");
const {
  create,
  getAllTeamById,
  updateTeam,
  getAllTeamByTeamId,
} = require("../controller/teamController");
const router = express.Router();
const upload = multer();  
router.post("/add_team", create);
router.get("/get_team/:startup_id", getAllTeamById);
router.get("/get_team_id/:id", getAllTeamByTeamId);
router.put("/update_team/:id", updateTeam);

module.exports = router;
