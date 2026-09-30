const mongoose = require("mongoose");
const Chat = require("./Chat");

const messageSchema = new mongoose.Schema(
  {
    chatId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Chat",
      required: true,
      index: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: {
      type: String,
      maxlength: 3000,
      default: "",
    },
    fileData: {
      type: String,
    },
    fileName: {
      type: String,
    },
    fileType: {
      type: String,
    },
    isEdited: {
      type: Boolean,
      default: false,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    readBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  { timestamps: true }
);

messageSchema.index({ chatId: 1, createdAt: 1 });

messageSchema.post("save", async function (doc) {
  try {
    const chat = await Chat.findById(doc.chatId);
    if (!chat) return;

    let snippet = doc.content ? doc.content.slice(0, 60) : "Attached File";
    if (doc.content && doc.content.length > 60) snippet += "...";

    chat.lastMessage = snippet;
    chat.lastMessageAt = doc.createdAt;
    chat.lastSender = doc.sender;

    chat.participants.forEach((pId) => {
      const pStr = pId.toString();
      if (pStr !== doc.sender.toString()) {
        const currentCount = chat.unreadCounts.get(pStr) || 0;
        chat.unreadCounts.set(pStr, currentCount + 1);
      }
    });

    await chat.save();
  } catch (err) {
    console.error("Error in message post-save hook:", err);
  }
});

module.exports = mongoose.model("Message", messageSchema);
