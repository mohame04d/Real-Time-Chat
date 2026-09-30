const Message = require("../models/Message");
const Chat = require("../models/Chat");

exports.sendMessage = async (req, res) => {
  try {
    const { chatId, content, fileData, fileName, fileType } = req.body;

    if (!chatId || (!content?.trim() && !fileData)) {
      return res.status(400).json({ status: "fail", message: "Chat ID and message content or attachment are required" });
    }

    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({ status: "fail", message: "Chat not found" });
    }

    const isParticipant = chat.participants.some(p => p.toString() === req.user._id.toString());
    if (!isParticipant) {
      return res.status(403).json({ status: "fail", message: "Not authorized in this chat" });
    }

    const message = await Message.create({
      chatId,
      sender: req.user._id,
      content: content ? content.trim() : "",
      fileData,
      fileName,
      fileType,
    });

    const populated = await Message.findById(message._id).populate("sender", "name avatar");

    const io = req.app.get("io");
    if (io) {
      io.to(chatId).emit("newMessage", populated);
      io.to(chatId).emit("chatUpdated", {
        chatId,
        lastMessage: populated,
      });
    }

    res.status(201).json({ status: "success", data: populated });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
};

exports.getMessages = async (req, res) => {
  try {
    const { chatId } = req.params;
    const { limit = 50, page = 1 } = req.query;

    const messages = await Message.find({ chatId })
      .populate("sender", "name avatar")
      .sort({ createdAt: 1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.status(200).json({
      status: "success",
      results: messages.length,
      data: messages,
    });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
};

exports.editMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;

    if (!content?.trim()) {
      return res.status(400).json({ status: "fail", message: "Content is required" });
    }

    const message = await Message.findById(id);
    if (!message) {
      return res.status(404).json({ status: "fail", message: "Message not found" });
    }

    if (message.sender.toString() !== req.user._id.toString()) {
      return res.status(403).json({ status: "fail", message: "You can only edit your own messages" });
    }

    message.content = content.trim();
    message.isEdited = true;
    await message.save();

    const populated = await Message.findById(message._id).populate("sender", "name avatar");

    const io = req.app.get("io");
    if (io) {
      io.to(message.chatId.toString()).emit("messageEdited", populated);
    }

    res.status(200).json({ status: "success", data: populated });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
};

exports.deleteMessage = async (req, res) => {
  try {
    const { id } = req.params;

    const message = await Message.findById(id);
    if (!message) {
      return res.status(404).json({ status: "fail", message: "Message not found" });
    }

    if (message.sender.toString() !== req.user._id.toString()) {
      return res.status(403).json({ status: "fail", message: "You can only delete your own messages" });
    }

    const chatId = message.chatId.toString();
    await message.deleteOne();

    const io = req.app.get("io");
    if (io) {
      io.to(chatId).emit("messageDeleted", id);
    }

    res.status(200).json({ status: "success", message: "Message deleted" });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
};
