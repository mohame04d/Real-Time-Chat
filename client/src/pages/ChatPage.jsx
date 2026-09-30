import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import Sidebar from '../components/Sidebar';
import ChatArea from '../components/ChatArea';
import NewChatModal from '../components/NewChatModal';
import api from '../api/api';
import toast from 'react-hot-toast';

export default function ChatPage() {
  const { user } = useAuth();
  const { socket, onlineUsers } = useSocket();

  const [chats, setChats] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isTypingMap, setIsTypingMap] = useState({});

  const activeChatRef = useRef(activeChat);

  useEffect(() => {
    activeChatRef.current = activeChat;
  }, [activeChat]);

  // Load Chats list
  const loadChats = async () => {
    try {
      const res = await api.get('/chats');
      setChats(res.data.data || []);
      if (!activeChat && res.data.data?.length > 0) {
        setActiveChat(res.data.data[0]);
      }
    } catch (err) {
      console.error('Failed to load chats:', err);
    }
  };

  useEffect(() => {
    loadChats();
  }, []);

  // Socket event listeners
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (newMsg) => {
      // If message is in current active chat, append it
      if (activeChatRef.current && activeChatRef.current._id === newMsg.chatId) {
        setMessages((prev) => [...prev, newMsg]);
        // Mark as read immediately if current chat is open
        api.patch(`/chats/${newMsg.chatId}/read`);
      }

      // Update last message in chat list
      setChats((prevChats) =>
        prevChats.map((c) => {
          if (c._id === newMsg.chatId) {
            const isMe = newMsg.sender?._id === user?._id;
            const updatedUnread = { ...c.unreadCounts };
            if (!isMe && activeChatRef.current?._id !== c._id) {
              updatedUnread[user._id] = (updatedUnread[user._id] || 0) + 1;
            }
            return {
              ...c,
              lastMessage: newMsg.content || 'Attached File',
              lastMessageAt: newMsg.createdAt,
              lastSender: newMsg.sender,
              unreadCounts: updatedUnread,
            };
          }
          return c;
        }).sort((a, b) => new Date(b.lastMessageAt) - new Date(a.lastMessageAt))
      );
    };

    const handleMessageEdited = (updatedMsg) => {
      setMessages((prev) =>
        prev.map((m) => (m._id === updatedMsg._id ? updatedMsg : m))
      );
    };

    const handleMessageDeleted = (deletedId) => {
      setMessages((prev) => prev.filter((m) => m._id !== deletedId));
    };

    const handleUserTyping = ({ chatId, userId, name, isTyping }) => {
      if (userId === user?._id) return;
      setIsTypingMap((prev) => ({
        ...prev,
        [chatId]: isTyping ? name : null,
      }));
    };

    const handleMessagesSeen = ({ chatId }) => {
      if (activeChatRef.current?._id === chatId) {
        setMessages((prev) =>
          prev.map((m) => ({ ...m, isRead: true }))
        );
      }
    };

    socket.on('newMessage', handleNewMessage);
    socket.on('messageEdited', handleMessageEdited);
    socket.on('messageDeleted', handleMessageDeleted);
    socket.on('userTyping', handleUserTyping);
    socket.on('messagesSeen', handleMessagesSeen);

    return () => {
      socket.off('newMessage', handleNewMessage);
      socket.off('messageEdited', handleMessageEdited);
      socket.off('messageDeleted', handleMessageDeleted);
      socket.off('userTyping', handleUserTyping);
      socket.off('messagesSeen', handleMessagesSeen);
    };
  }, [socket, user]);

  // Handle active chat selection & room join
  useEffect(() => {
    if (!activeChat) return;

    const fetchMessages = async () => {
      try {
        const res = await api.get(`/messages/${activeChat._id}?limit=60`);
        setMessages(res.data.data || []);
        // Reset unread count locally and on server
        await api.patch(`/chats/${activeChat._id}/read`);
        setChats((prev) =>
          prev.map((c) =>
            c._id === activeChat._id
              ? { ...c, unreadCounts: { ...c.unreadCounts, [user?._id]: 0 } }
              : c
          )
        );
      } catch (err) {
        console.error('Failed to load messages:', err);
      }
    };

    fetchMessages();

    if (socket) {
      socket.emit('joinChat', activeChat._id);
    }

    return () => {
      if (socket) {
        socket.emit('leaveChat', activeChat._id);
      }
    };
  }, [activeChat, socket]);

  const handleSelectChat = (chat) => {
    setActiveChat(chat);
  };

  const handleStartChatWithUser = async (targetUser) => {
    try {
      const res = await api.post('/chats', { userId: targetUser._id });
      const chat = res.data.data;

      setChats((prev) => {
        const exists = prev.find((c) => c._id === chat._id);
        if (exists) return prev;
        return [chat, ...prev];
      });

      setActiveChat(chat);
      setIsModalOpen(false);
    } catch (err) {
      toast.error('Failed to start chat');
    }
  };

  return (
    <div className="chat-layout">
      <Sidebar
        chats={chats}
        activeChat={activeChat}
        onSelectChat={handleSelectChat}
        onOpenNewChat={() => setIsModalOpen(true)}
        onlineUsers={onlineUsers}
      />
      <ChatArea
        activeChat={activeChat}
        messages={messages}
        setMessages={setMessages}
        typingUser={activeChat ? isTypingMap[activeChat._id] : null}
        onlineUsers={onlineUsers}
        onBack={() => setActiveChat(null)}
      />
      {isModalOpen && (
        <NewChatModal
          onClose={() => setIsModalOpen(false)}
          onSelectUser={handleStartChatWithUser}
        />
      )}
    </div>
  );
}
