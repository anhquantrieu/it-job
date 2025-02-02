const express = require("express");
const router = express.Router();
const { createConversation, getConversationById } = require("../controllers/conversationController");
const {authenticate} = require("../middlewares/authMiddleware");

router.post("/", authenticate , createConversation);
router.get("/:conversationId", authenticate , getConversationById);

module.exports = router;
