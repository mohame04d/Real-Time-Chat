const expess = require("express");
const app = expess();
const http = require("http").createServer(app);
const io = require("socket.io")(http);

// Serve static files from the "public" directory
app.use(expess.static("public"));

app.set("view engine", "ejs");

app.get("/", (req, res) => {
  res.render("index");
});

// شات جماعي
const users = {};

// Listen for socket connections
io.on("connection", (socket) => {
  console.log("A user connected");

  // Listen for the "join" event from the client
  socket.on("join", (userName) => {
    users[socket.id] = userName;

    // Emit the "joined_user" event to all clients except the one that just joined
    socket.broadcast.emit("joined_user", userName);
  });

  // Listen for chat messages from the client
  socket.on("chat_message", (msg) => {

    // Emit the "chat" event to all clients except the one that sent the message
    socket.broadcast.emit("chat", { user: users[socket.id], msg: msg });
  });

  // Listen for the "disconnect" event from the client
  socket.on("disconnect", () => {
    console.log("A user disconnected");

    // Emit the "left_user" event to all clients except the one that just left
    socket.broadcast.emit("left_user", {
      userName: users[socket.id],
      message: "left the chat",
    });
    delete users[socket.id];
  });
});

// Start the server
http.listen(3000, () => {
  console.log("Server is running on port 3000");
});
