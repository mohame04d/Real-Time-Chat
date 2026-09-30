import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import MessageItem from './MessageItem';
import MessageInput from './MessageInput';
import { FaComments, FaArrowLeft } from 'react-icons/fa';

export default function ChatArea({ activeChat, messages, setMessages, typingUser, onlineUsers, onBack }) {
  const { user } = useAuth();
  const { socket } = useSocket();
  const [editingMessage, setEditingMessage] = useState(null);
  const messagesEndRef = useRef(null);

  const getPartner = () => {
    return activeChat?.participants?.find((p) => p._id !== user?._id) || {};
  };

  const partner = getPartner();
  const isPartnerOnline = partner?._id && onlineUsers.includes(partner._id);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typingUser]);

  if (!activeChat) {
    return (
      <main className="chat-area empty-state">
        <div className="empty-content">
          <div className="empty-icon-circle">
            <FaComments />
          </div>
          <h2>Select a conversation</h2>
          <p>Choose an existing chat from the left or start a new conversation to start messaging in real time.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="chat-area">
      {/* Header */}
      <header className="chat-header">
        <button className="btn-icon mobile-back-btn" onClick={onBack}>
          <FaArrowLeft />
        </button>

        <div className="partner-profile">
          <div className="avatar-wrapper">
            <img src={partner.avatar} alt={partner.name} className="partner-avatar" />
            {isPartnerOnline && <span className="online-badge" />}
          </div>
          <div className="partner-details">
            <span className="partner-name">{partner.name}</span>
            <span className="partner-status">
              {typingUser ? (
                <span className="typing-text">{typingUser} is typing...</span>
              ) : isPartnerOnline ? (
                <span className="status-online">Online</span>
              ) : (
                'Offline'
              )}
            </span>
          </div>
        </div>
      </header>

      {/* Messages Feed */}
      <div className="messages-container">
        {messages.map((msg) => (
          <MessageItem
            key={msg._id}
            message={msg}
            isMe={msg.sender?._id === user?._id}
            onEdit={(m) => setEditingMessage(m)}
          />
        ))}

        {typingUser && (
          <div className="typing-indicator-bubble">
            <div className="dot" />
            <div className="dot" />
            <div className="dot" />
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Bar */}
      <MessageInput
        activeChat={activeChat}
        editingMessage={editingMessage}
        setEditingMessage={setEditingMessage}
      />
    </main>
  );
}
