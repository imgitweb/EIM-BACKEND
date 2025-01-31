const express = require("express");
const router = express.Router();
const messageController = require("../controller/messageController");

// POST /api/messages - Create a new message
router.post("/", messageController.createMessage);

// GET /api/messages - Get all messages (Optional)
router.get("/", messageController.getAllMessages);

module.exports = router;
