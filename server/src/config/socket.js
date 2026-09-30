const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Chat = require("../models/Chat");

const onlineUsers = new Map();

module.exports = (io) => {
  io.use(async (socket, next) => {
    try {
      let token = socket.handshake.query?.token;

      if (!token && socket.handshake.auth?.token) {
        token = socket.handshake.auth.token;
      }

      if (!token) {
        return next(new Error("Authentication error: No token provided"));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select("-password");

      if (!user) {
        return next(new Error("Authentication error: User not found"));
      }

      socket.user = user;
      next();
    } catch (err) {
      console.log("Socket authentication error:", err.message);
      next(new Error("Authentication error: Invalid or expired token"));
    }
  });

  io.on("connection", async (socket) => {
    const userId = socket.user._id.toString();
    console.log(`🟢 User connected: ${socket.user.name} (${userId})`);

    onlineUsers.set(userId, socket.id);
    await User.findByIdAndUpdate(userId, { isOnline: true });

    io.emit("getOnlineUsers", Array.from(onlineUsers.keys()));

    socket.join(userId);

    socket.on("joinChat", async (chatId) => {
      try {
        const chat = await Chat.findById(chatId);
        if (!chat) return socket.emit("error", "Chat not found");

        const isParticipant = chat.participants.some(p => p.toString() === userId);
        if (!isParticipant) {
          return socket.emit("error", "Unauthorized to join this room");
        }

        socket.join(chatId);
      } catch (err) {
        console.log("Error joining chat:", err.message);
      }
    });

    socket.on("leaveChat", (chatId) => {
      socket.leave(chatId);
    });

    socket.on("typing", async ({ chatId, isTyping }) => {
      try {
        socket.to(chatId).emit("userTyping", {
          chatId,
          userId,
          name: socket.user.name,
          isTyping,
        });
      } catch (err) {
        console.log("Error handling typing event:", err.message);
      }
    });

    socket.on("disconnect", async () => {
      console.log(`🔴 User disconnected: ${socket.user.name} (${userId})`);
      onlineUsers.delete(userId);
      await User.findByIdAndUpdate(userId, { isOnline: false, lastSeen: new Date() });
      io.emit("getOnlineUsers", Array.from(onlineUsers.keys()));
    });
  });
};
