# 💬 Full-Stack Real-Time Chat Application

A high-performance, modern, and scalable **Real-Time 1-on-1 Chat Application** built using **React (Vite)**, **Node.js**, **Express**, **Socket.io**, and **MongoDB**.

---

## 🌟 Key Features

- ⚡ **Instant Messaging**: Real-time message delivery and instant updates powered by **Socket.io**.
- 🔒 **Secure Authentication**: User registration and login protected by **JWT (JSON Web Tokens)** and **bcryptjs** password hashing.
- 🟢 **Live Online/Offline Presence**: Tracks and broadcasts connected users across rooms dynamically.
- ✍️ **Typing Indicators**: Real-time feedback when the other user is typing with animated bubble indicators.
- 📎 **Image & File Attachments**: In-browser client-side image compression (HTML5 Canvas) and file sharing support.
- ✏️ **Edit & Delete Messages**: Modify or remove your sent messages in real time with synchronized updates for both users.
- ✔️✔️ **Read Receipts (Seen Status)**: Double checkmarks showing whether your message was delivered or seen.
- 🔍 **User Search & Direct Chat**: Instant search across all registered users to start new direct 1-on-1 conversations with a single click.
- 🎨 **Modern Sleek UI**: Beautiful dark-mode design with smooth animations, mobile responsiveness, and clean message bubbles.

---

## 🏗️ Architecture & Technologies

### Backend (`server/`)
- **Node.js & Express**: RESTful API architecture for authentication, conversations, and message persistence.
- **Socket.io**: Bidirectional WebSocket communication for real-time events.
- **MongoDB & Mongoose**: Fast document database for users, chats, and message history.
- **JWT & bcryptjs**: Secure stateless authentication and password hashing.

### Frontend (`client/`)
- **React 18 & Vite**: Ultra-fast build tool and reactive component hierarchy.
- **Socket.io-client**: Real-time socket event consumption.
- **Axios**: HTTP client with Bearer token interceptor.
- **React Hot Toast**: Clean notifications and alerts.
- **React Icons**: Modern icon set for intuitive user experience.

---

## 📂 Project Structure

```
Real-Time-Chat/
├── server/
│   ├── src/
│   │   ├── config/          # Database (Mongoose) & Socket.io configuration
│   │   ├── controllers/     # Auth, User, Chat, and Message controllers
│   │   ├── middleware/      # JWT authentication & error handling
│   │   ├── models/          # User, Chat, and Message schemas
│   │   ├── routes/          # Express route definitions
│   │   └── app.js           # Express app setup & middleware
│   ├── server.js            # HTTP Server & Socket.io initialization
│   ├── package.json
│   └── .env.example
│
├── client/
│   ├── src/
│   │   ├── api/             # Axios instance & interceptors
│   │   ├── components/      # Sidebar, ChatArea, MessageItem, Input, Modal
│   │   ├── context/         # AuthContext & SocketContext
│   │   ├── pages/           # LoginPage, RegisterPage, ChatPage
│   │   ├── styles/          # Modern stylesheet
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
├── package.json             # Root runner scripts
└── README.md
```

---

## 🚀 Quick Start Guide

### Prerequisites
- [Node.js](https://nodejs.org/) (v16 or higher)
- [MongoDB](https://www.mongodb.com/) running locally or a MongoDB Atlas URI

### 1. Clone the repository
```bash
git clone https://github.com/mohame04d/Real-Time-Chat.git
cd Real-Time-Chat
```

### 2. Configure Environment Variables
Inside the `server/` directory, create a `.env` file (or copy `.env.example`):
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/realtime_chat
JWT_SECRET=your_super_secret_jwt_key
CLIENT_URL=http://localhost:5173
```

### 3. Install Dependencies
Run the following from the root directory:
```bash
# Install Server Dependencies
cd server
npm install

# Install Client Dependencies
cd ../client
npm install
```

### 4. Run the Application
Open two terminal tabs:

**Terminal 1 (Backend Server):**
```bash
cd server
npm run dev
```
*Server runs on: `http://localhost:5000`*

**Terminal 2 (Frontend Client):**
```bash
cd client
npm run dev
```
*Client runs on: `http://localhost:5173`*

---

## 📡 Socket.io Events Reference

| Event Name | Direction | Payload | Description |
|---|---|---|---|
| `joinChat` | Client -> Server | `chatId` | Join a specific 1-on-1 chat room |
| `leaveChat` | Client -> Server | `chatId` | Leave a specific chat room |
| `typing` | Client -> Server | `{ chatId, isTyping }` | Trigger typing state |
| `userTyping` | Server -> Client | `{ chatId, userId, name, isTyping }` | Broadcasts typing state to partner |
| `newMessage` | Server -> Client | `Message object` | Delivers new incoming message in real time |
| `messageEdited`| Server -> Client | `Message object` | Updates message content in real time |
| `messageDeleted`| Server -> Client| `messageId` | Removes message from both users' screens |
| `messagesSeen` | Server -> Client | `{ chatId, userId }` | Updates read receipts to double ticks |
| `getOnlineUsers`| Server -> Client| `[userId, ...]` | Live array of all currently connected users |

---

## 📄 License
This project is licensed under the MIT License.
