import React, { useState } from 'react';
import api from '../api/api';
import toast from 'react-hot-toast';
import { FaCheck, FaCheckDouble, FaEllipsisV, FaEdit, FaTrash, FaFileDownload } from 'react-icons/fa';

export default function MessageItem({ message, isMe, onEdit }) {
  const [showMenu, setShowMenu] = useState(false);

  const handleDelete = async () => {
    if (!window.confirm('Delete this message?')) return;
    try {
      await api.delete(`/messages/${message._id}`);
    } catch (err) {
      toast.error('Failed to delete message');
    }
  };

  const isImage = message.fileType?.startsWith('image/') || message.fileData?.startsWith('data:image/');

  return (
    <div className={`message-row ${isMe ? 'message-sent' : 'message-received'}`}>
      <div className="message-bubble-wrapper">
        <div className="message-bubble">
          {/* File Attachment */}
          {message.fileData && (
            <div className="message-attachment">
              {isImage ? (
                <img src={message.fileData} alt={message.fileName || 'Attachment'} className="attachment-image" />
              ) : (
                <a href={message.fileData} download={message.fileName || 'document'} className="attachment-file">
                  <FaFileDownload />
                  <span>{message.fileName || 'Download File'}</span>
                </a>
              )}
            </div>
          )}

          {/* Text Content */}
          {message.content && (
            <p className="message-text">{message.content}</p>
          )}

          {/* Metadata */}
          <div className="message-meta">
            {message.isEdited && <span className="edited-tag">(edited)</span>}
            <span className="timestamp">
              {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
            {isMe && (
              <span className="read-status">
                {message.isRead ? <FaCheckDouble className="seen" /> : <FaCheck />}
              </span>
            )}
          </div>
        </div>

        {/* Menu for My Messages */}
        {isMe && (
          <div className="message-actions">
            <button className="btn-action-trigger" onClick={() => setShowMenu(!showMenu)}>
              <FaEllipsisV />
            </button>
            {showMenu && (
              <div className="actions-dropdown">
                {message.content && (
                  <button onClick={() => { onEdit(message); setShowMenu(false); }}>
                    <FaEdit /> Edit
                  </button>
                )}
                <button onClick={() => { handleDelete(); setShowMenu(false); }} className="delete-btn">
                  <FaTrash /> Delete
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
