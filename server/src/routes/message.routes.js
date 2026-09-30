const express = require("express");
const router = express.Router();
const messageController = require("../controllers/message.controller");
const { protect } = require("../middleware/auth.middleware");

router.use(protect);
router.post("/", messageController.sendMessage);
router.get("/:chatId", messageController.getMessages);
router.patch("/:id", messageController.editMessage);
router.delete("/:id", messageController.deleteMessage);

module.exports = router;
