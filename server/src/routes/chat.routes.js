const express = require("express");
const router = express.Router();
const chatController = require("../controllers/chat.controller");
const { protect } = require("../middleware/auth.middleware");

router.use(protect);
router.post("/", chatController.accessChat);
router.get("/", chatController.getChats);
router.patch("/:chatId/read", chatController.markAsRead);

module.exports = router;
