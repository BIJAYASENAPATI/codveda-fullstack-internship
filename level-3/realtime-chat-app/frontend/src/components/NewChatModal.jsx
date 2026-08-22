import React, { useState, useEffect } from "react";
import { getUsers } from "../services/userService";

function NewChatModal({ currentUserId, onClose, onStartChat }) {
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        setError("");
        const data = await getUsers();
        // Exclude current logged-in user
        const otherUsers = data.filter(
          (u) => Number(u.id) !== Number(currentUserId)
        );
        setUsers(otherUsers);
      } catch (err) {
        console.error("Fetch users error:", err);
        setError(err.message || "Failed to load users list.");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [currentUserId]);

  const filteredUsers = users.filter((user) => {
    const name = (user.name || "").toLowerCase();
    const email = (user.email || "").toLowerCase();
    const query = searchQuery.toLowerCase();
    return name.includes(query) || email.includes(query);
  });

  const getInitial = (name) => {
    return name?.charAt(0)?.toUpperCase() || "?";
  };

  return (
    <div className="forward-modal-backdrop" onClick={onClose}>
      <div
        className="forward-modal-container new-chat-modal-container"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="forward-modal-header">
          <h3>New Chat / Search Users</h3>
          <button type="button" className="close-btn" onClick={onClose}>
            &times;
          </button>
        </div>

        <div className="forward-modal-body">
          <input
            type="text"
            className="forward-search-input"
            placeholder="Search users by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            autoFocus
          />

          {loading && (
            <div className="loading-container" style={{ minHeight: "120px" }}>
              <div className="loading-spinner"></div>
            </div>
          )}

          {error && <div className="error-message">{error}</div>}

          {!loading && !error && (
            <div className="forward-chats-list new-chat-users-list">
              {filteredUsers.length === 0 ? (
                <div className="empty-state" style={{ padding: "20px" }}>
                  <div className="empty-state-title">No users found</div>
                  <div className="empty-state-subtitle">
                    Try searching for another name or email.
                  </div>
                </div>
              ) : (
                filteredUsers.map((user) => (
                  <div key={user.id} className="forward-chat-item new-chat-user-item">
                    <div className="chat-avatar">
                      {getInitial(user.name)}
                      {user.isOnline && (
                        <span className="avatar-status-dot online" style={{ bottom: 0, right: 0, width: 8, height: 8 }} />
                      )}
                    </div>
                    <div className="chat-info">
                      <span className="chat-name">{user.name}</span>
                      <span className="chat-type" style={{ textTransform: "none" }}>{user.email}</span>
                    </div>
                    <div className="new-chat-action">
                      <button
                        type="button"
                        className="modal-submit-btn new-chat-start-btn"
                        onClick={() => onStartChat(user.id)}
                      >
                        Start Chat
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        <div className="forward-modal-footer">
          <button type="button" className="modal-cancel-btn" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default NewChatModal;
