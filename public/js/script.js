const audio = new Audio("../ByNW04d97PI.mp3");
const chatbox = document.querySelector("#chatbox");

const socket = io("http://localhost:3000");

// Listen for the "connected" event from the server
socket.on("connected", () => {
  console.log("Connected to the server");
});

const userName = prompt("Enter your name:");

// Emit the "join" event to the server with the user's name
socket.emit("join", userName);

// Listen for events from the server
socket.on("joined_user", (userName) => {
  chatbox.scrollTop=chatbox.scrollHeight
  displayMessage(userName, "joined the chat");
});

// Listen for chat messages from the server
socket.on("chat", (data) => {
  displayMessage(data.user, data.msg);
  // Play the audio notification for new messages
  audio.play();
  // Scroll to the bottom of the chatbox
  chatbox.scrollTop = chatbox.scrollHeight;
});

// Listen for the "left_user" event from the server
socket.on("left_user", (data) => {
  displayMessage(data.userName, data.message);
});

const input = document.querySelector("input");
const button = document.querySelector("button");

// Send a chat message when the button is clicked
button.addEventListener("click", () => {
  if (input.value.trim() == "") {
    alert("Please enter a message");
  } else {
    // Emit the "chat_message" event to the server with the message
    socket.emit("chat_message", input.value);

    // Display the message in the chatbox
    displayMessage("You", input.value);
    chatbox.scrollTop = chatbox.scrollHeight;
    input.value = "";
  }
});

// Function to display a message in the chatbox
function displayMessage(user, msg) {
  const div = document.createElement("div");
  div.classList.add("message");
  div.innerHTML = `<p class="user">${user}</p>
                <p class="chat_message">${msg}</p>`;
  chatbox.appendChild(div);
}
