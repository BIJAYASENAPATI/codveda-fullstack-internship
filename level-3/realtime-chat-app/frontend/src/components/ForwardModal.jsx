import React, { useState } from "react";

function ForwardModal({ chats, currentUserId, onClose, onConfirm }) {
  const [selectedChats, setSelectedChats] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  const toggleSelect = (chatId) => {
    setSelectedChats((prev) =>
      prev.includes(chatId)
        ? prev.filter((id) => id !== chatId)
        : [...prev, chatId]
    );
  };

  const getChatName = (chat) => {
    if (chat.chat_type === "GROUP") {
      return chat.name || "Group Chat";
    }
    // For DM — find the other participant's name
    const otherParticipant = chat.participants?.find(
      (p) => Number(p.user_id) !== Number(currentUserId)
    );
    return otherParticipant?.user?.name || chat.name || `Chat ${chat.id}`;
  };

  const filteredChats = chats.filter((chat) => {
    const name = getChatName(chat).toLowerCase();
    return name.includes(searchQuery.toLowerCase());
  });

  const handleForward = () => {
    if (selectedChats.length === 0) return;
    onConfirm(selectedChats);
  };

  return (
    <div className="forward-modal-backdrop">
      <div className="forward-modal-container">
        <div className="forward-modal-header">
          <h3>Forward Message</h3>
          <button type="button" className="close-btn" onClick={onClose}>
            &times;
          </button>
        </div>

        <div className="forward-modal-body">
          <input
            type="text"
            className="forward-search-input"
            placeholder="Search chats..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />

          <div className="forward-chats-list">
            {filteredChats.length === 0 ? (
              <div className="empty-state">No chats found</div>
            ) : (
              filteredChats.map((chat) => {
                const isSelected = selectedChats.includes(chat.id);
                return (
                  <div
                    key={chat.id}
                    className={`forward-chat-item ${isSelected ? "selected" : ""}`}
                    onClick={() => toggleSelect(chat.id)}
                  >
                    <div className="chat-avatar">
                      {getChatName(chat).charAt(0).toUpperCase()}
                    </div>
                    <div className="chat-info">
                      <span className="chat-name">{getChatName(chat)}</span>
                      <span className="chat-type">
                        {chat.chat_type === "GROUP" ? "Group" : "Direct Message"}
                      </span>
                    </div>
                    <div className="checkbox-wrapper">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelect(chat.id)}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className="forward-modal-footer">
          <button type="button" className="modal-cancel-btn" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className="modal-forward-btn"
            disabled={selectedChats.length === 0}
            onClick={handleForward}
          >
            Forward ({selectedChats.length})
          </button>
        </div>
      </div>
    </div>
  );
}

export default ForwardModal;
