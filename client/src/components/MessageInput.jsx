import React, { useState, useRef, useEffect } from 'react';
import api from '../api/api';
import { useSocket } from '../context/SocketContext';
import toast from 'react-hot-toast';
import { FaPaperclip, FaPaperPlane, FaTimes } from 'react-icons/fa';

export default function MessageInput({ activeChat, editingMessage, setEditingMessage }) {
  const { socket } = useSocket();
  const [content, setContent] = useState('');
  const [file, setFile] = useState(null);
  const [sending, setSending] = useState(false);
  const fileInputRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    if (editingMessage) {
      setContent(editingMessage.content || '');
      setFile(null);
    }
  }, [editingMessage]);

  const handleInputChange = (e) => {
    setContent(e.target.value);

    // Emit typing indicator
    if (socket && activeChat) {
      socket.emit('typing', { chatId: activeChat._id, isTyping: true });

      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        socket.emit('typing', { chatId: activeChat._id, isTyping: false });
      }, 1500);
    }
  };

  const compressImage = (fileObj) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.src = e.target.result;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 900;
          let width = img.width;
          let height = img.height;

          if (width > MAX_WIDTH) {
            height = (height * MAX_WIDTH) / width;
            width = MAX_WIDTH;
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', 0.75));
        };
      };
      reader.readAsDataURL(fileObj);
    });
  };

  const handleFileChange = async (e) => {
    const selected = e.target.files[0];
    if (!selected) return;

    if (selected.type.startsWith('image/')) {
      const compressedDataUrl = await compressImage(selected);
      setFile({
        fileData: compressedDataUrl,
        fileName: selected.name,
        fileType: 'image/jpeg',
      });
    } else {
      if (selected.size > 5 * 1024 * 1024) {
        toast.error('Document size must be under 5MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFile({
          fileData: reader.result,
          fileName: selected.name,
          fileType: selected.type,
        });
      };
      reader.readAsDataURL(selected);
    }
  };

  const handleSend = async (e) => {
    e?.preventDefault();
    if ((!content.trim() && !file) || sending || !activeChat) return;

    setSending(true);
    try {
      if (editingMessage) {
        await api.patch(`/messages/${editingMessage._id}`, { content });
        setEditingMessage(null);
      } else {
        await api.post('/messages', {
          chatId: activeChat._id,
          content,
          ...(file && file),
        });
      }

      setContent('');
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';

      // Stop typing
      if (socket) {
        socket.emit('typing', { chatId: activeChat._id, isTyping: false });
      }
    } catch (err) {
      toast.error('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="message-input-bar">
      {/* Editing Banner */}
      {editingMessage && (
        <div className="editing-banner">
          <span>Editing message: <i>"{editingMessage.content}"</i></span>
          <button className="btn-cancel" onClick={() => { setEditingMessage(null); setContent(''); }}>
            <FaTimes />
          </button>
        </div>
      )}

      {/* File Preview */}
      {file && (
        <div className="file-preview-card">
          <span>Attachment: {file.fileName}</span>
          <button className="btn-cancel" onClick={() => setFile(null)}>
            <FaTimes />
          </button>
        </div>
      )}

      <form onSubmit={handleSend} className="input-form">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          style={{ display: 'none' }}
        />
        <button
          type="button"
          className="btn-attach"
          onClick={() => fileInputRef.current?.click()}
          title="Attach Image or File"
        >
          <FaPaperclip />
        </button>

        <input
          type="text"
          placeholder="Type a message..."
          value={content}
          onChange={handleInputChange}
          className="chat-text-input"
          autoFocus
        />

        <button type="submit" disabled={sending || (!content.trim() && !file)} className="btn-send">
          <FaPaperPlane />
        </button>
      </form>
    </div>
  );
}
