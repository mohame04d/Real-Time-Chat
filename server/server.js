const http = require("http");
const { Server } = require("socket.io");
const dotenv = require("dotenv");
dotenv.config();

const app = require("./src/app");
const connectDB = require("./src/config/db");
const initializeSocket = require("./src/config/socket");

const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.io
const io = new Server(server, {
  cors: {
    origin: [CLIENT_URL, "http://localhost:5173", "http://localhost:3000"],
    methods: ["GET", "POST", "PATCH", "DELETE"],
    credentials: true,
  },
  pingTimeout: 60000,
  pingInterval: 25000,
});

// Setup Socket handlers & store io in app
initializeSocket(io);
app.set("io", io);

// Connect DB & start server
connectDB().then(() => {
  server.listen(PORT, () => {
    console.log(`🚀 Server running on port: ${PORT}`);
    console.log(`📡 Socket.io ready for connections`);
  });
}).catch(err => {
  console.error("Failed to connect to MongoDB:", err.message);
});
