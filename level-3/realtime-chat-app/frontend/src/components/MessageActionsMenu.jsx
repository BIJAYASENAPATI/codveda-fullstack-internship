import React, { useState, useEffect, useRef } from "react";

function MessageActionsMenu({
  message,
  currentUserId,
  onViewInfo,
  onTogglePin,
  onForward,
  onStartEdit,
  onDelete,
  openUpwards,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  const isMe = Number(message.sender_id) === Number(currentUserId);
  const isDeleted = Boolean(message.deleted_for_everyone);

  // Check if message is less than 15 minutes old
  const isEditable = () => {
    if (!isMe || isDeleted) return false;
    const diffMs = new Date() - new Date(message.createdAt);
    const diffMins = diffMs / 1000 / 60;
    return diffMins <= 15;
  };

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  if (isDeleted) {
    // Deleted messages only support "Delete for me" if users want, or nothing.
    // Let's hide options except Delete for me if they want.
    return null;
  }

  return (
    <div className={`message-actions-container ${isOpen ? "open" : ""}`} ref={menuRef}>
      <button
        type="button"
        className="message-actions-trigger"
        onClick={() => setIsOpen(!isOpen)}
        title="Message options"
      >
        ▾
      </button>

      {isOpen && (
        <div className={`message-actions-dropdown ${openUpwards ? "upwards" : ""}`}>
          <button
            type="button"
            className="action-item"
            onClick={() => {
              onViewInfo(message);
              setIsOpen(false);
            }}
          >
            ℹ️ Info
          </button>

          <button
            type="button"
            className="action-item"
            onClick={() => {
              onTogglePin(message);
              setIsOpen(false);
            }}
          >
            📌 {message.is_pinned ? "Unpin" : "Pin"}
          </button>

          <button
            type="button"
            className="action-item"
            onClick={() => {
              onForward(message);
              setIsOpen(false);
            }}
          >
            ➡️ Forward
          </button>

          {isEditable() && (
            <button
              type="button"
              className="action-item"
              onClick={() => {
                onStartEdit(message);
                setIsOpen(false);
              }}
            >
              ✏️ Edit
            </button>
          )}

          <div className="action-divider" />

          <button
            type="button"
            className="action-item delete-action"
            onClick={() => {
              onDelete(message);
              setIsOpen(false);
            }}
          >
            🗑️ Delete
          </button>
        </div>
      )}
    </div>
  );
}

export default MessageActionsMenu;
