import React, { useState, useEffect } from 'react';
import api from '../api/api';
import { FaTimes, FaSearch, FaUserPlus } from 'react-icons/fa';

export default function NewChatModal({ onClose, onSelectUser }) {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/users?search=${search}`);
        setUsers(res.data.data || []);
      } catch (err) {
        console.error('Failed to fetch users:', err);
      } finally {
        setLoading(false);
      }
    };

    const delay = setTimeout(fetchUsers, 300);
    return () => clearTimeout(delay);
  }, [search]);

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Start New Chat</h3>
          <button className="btn-close" onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        <div className="modal-search">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search users by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            autoFocus
          />
        </div>

        <div className="modal-user-list">
          {loading ? (
            <p className="modal-hint">Searching...</p>
          ) : users.length === 0 ? (
            <p className="modal-hint">No registered users found</p>
          ) : (
            users.map((u) => (
              <div key={u._id} className="modal-user-item" onClick={() => onSelectUser(u)}>
                <img src={u.avatar} alt={u.name} className="modal-user-avatar" />
                <div className="modal-user-info">
                  <span className="modal-user-name">{u.name}</span>
                  <span className="modal-user-email">{u.email}</span>
                </div>
                <FaUserPlus className="add-icon" />
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
