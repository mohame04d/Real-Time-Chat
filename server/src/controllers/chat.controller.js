const Chat = require("../models/Chat");
const Message = require("../models/Message");

exports.accessChat = async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ status: "fail", message: "User ID is required" });
    }

    let chat = await Chat.findOne({
      participants: { $all: [req.user._id, userId], $size: 2 },
    }).populate("participants", "-password");

    if (chat) {
      return res.status(200).json({ status: "success", data: chat });
    }

    const newChat = await Chat.create({
      participants: [req.user._id, userId],
      unreadCounts: {
        [req.user._id.toString()]: 0,
        [userId.toString()]: 0,
      },
    });

    const populatedChat = await Chat.findById(newChat._id).populate("participants", "-password");

    res.status(201).json({ status: "success", data: populatedChat });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
};

exports.getChats = async (req, res) => {
  try {
    const chats = await Chat.find({
      participants: req.user._id,
    })
      .populate("participants", "-password")
      .populate("lastSender", "name avatar")
      .sort({ lastMessageAt: -1 });

    res.status(200).json({
      status: "success",
      results: chats.length,
      data: chats,
    });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
};

exports.markAsRead = async (req, res) => {
  try {
    const { chatId } = req.params;
    const userId = req.user._id.toString();

    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({ status: "fail", message: "Chat not found" });
    }

    chat.unreadCounts.set(userId, 0);
    await chat.save();

    await Message.updateMany(
      { chatId, sender: { $ne: req.user._id }, isRead: false },
      { isRead: true, $addToSet: { readBy: req.user._id } }
    );

    const io = req.app.get("io");
    if (io) {
      io.to(chatId).emit("messagesSeen", { chatId, userId });
    }

    res.status(200).json({ status: "success", message: "Chat marked as read" });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
};
