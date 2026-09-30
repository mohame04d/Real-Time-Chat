import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { FaSearch, FaPlus, FaSignOutAlt } from 'react-icons/fa';

export default function Sidebar({ chats, activeChat, onSelectChat, onOpenNewChat, onlineUsers }) {
  const { user, logout } = useAuth();
  const [search, setSearch] = useState('');

  const getPartner = (chat) => {
    return chat.participants?.find((p) => p._id !== user?._id) || {};
  };

  const filteredChats = chats.filter((chat) => {
    const partner = getPartner(chat);
    return partner.name?.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <aside className="sidebar">
      {/* User Header */}
      <div className="sidebar-header">
        <div className="user-profile">
          <div className="avatar-wrapper">
            <img src={user?.avatar} alt={user?.name} className="user-avatar" />
            <span className="online-badge" />
          </div>
          <div className="user-info">
            <span className="user-name">{user?.name}</span>
            <span className="user-status">Online</span>
          </div>
        </div>
        <button className="btn-icon" onClick={logout} title="Sign Out">
          <FaSignOutAlt />
        </button>
      </div>

      {/* Action / Search Bar */}
      <div className="sidebar-search-bar">
        <div className="search-input-wrapper">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search conversations..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <button className="btn-new-chat" onClick={onOpenNewChat} title="Start New Conversation">
          <FaPlus />
        </button>
      </div>

      {/* Conversations List */}
      <div className="chat-list">
        {filteredChats.length === 0 ? (
          <div className="empty-chat-list">
            <p>No conversations yet</p>
            <button className="btn-secondary" onClick={onOpenNewChat}>
              Start a chat
            </button>
          </div>
        ) : (
          filteredChats.map((chat) => {
            const partner = getPartner(chat);
            const isOnline = onlineUsers.includes(partner._id);
            const isSelected = activeChat?._id === chat._id;
            const unreadCount = chat.unreadCounts?.[user?._id] || 0;

            return (
              <div
                key={chat._id}
                className={`chat-item ${isSelected ? 'active' : ''}`}
                onClick={() => onSelectChat(chat)}
              >
                <div className="avatar-wrapper">
                  <img src={partner.avatar} alt={partner.name} className="chat-avatar" />
                  {isOnline && <span className="online-badge" />}
                </div>

                <div className="chat-info">
                  <div className="chat-name-time">
                    <span className="chat-name">{partner.name}</span>
                    <span className="chat-time">
                      {chat.lastMessageAt ? new Date(chat.lastMessageAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                    </span>
                  </div>

                  <div className="chat-last-message">
                    <span className="snippet">
                      {chat.lastMessage || 'No messages yet'}
                    </span>
                    {unreadCount > 0 && (
                      <span className="unread-badge">{unreadCount}</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </aside>
  );
}
