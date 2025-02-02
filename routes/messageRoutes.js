const express = require("express");
const router = express.Router();
const { getMessages, sendMessage, getCandidates } = require("../controllers/messageController");
const {authenticate} = require("../middlewares/authMiddleware");

router.get("/:conversationId", authenticate , getMessages);
router.get("/candidates", authenticate , getCandidates);
router.post("/send", authenticate , sendMessage);

module.exports = router;
