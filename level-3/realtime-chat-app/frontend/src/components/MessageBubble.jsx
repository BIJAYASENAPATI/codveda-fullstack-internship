import React from "react";
import MessageActionsMenu from "./MessageActionsMenu";

function MessageBubble({
  message,
  currentUserId,
  onViewInfo,
  onTogglePin,
  onForward,
  onStartEdit,
  onDelete,
  isEditing,
  editVal,
  setEditVal,
  onSaveEdit,
  onCancelEdit,
  openUpwards,
}) {
  const mine = Number(message.sender_id) === Number(currentUserId);
  const isDeleted = Boolean(message.deleted_for_everyone);

  const formatTime = (value) => {
    if (!value) return "";
    return new Date(value).toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const renderStatus = () => {
    if (!mine || isDeleted) return null;

    switch (message.status) {
      case "READ":
        return (
          <span className="message-status read" title="Read">
            ✓✓
          </span>
        );
      case "DELIVERED":
        return (
          <span className="message-status delivered" title="Delivered">
            ✓✓
          </span>
        );
      case "SENT":
      default:
        return (
          <span className="message-status sent" title="Sent">
            ✓
          </span>
        );
    }
  };

  return (
    <div className={`message-row ${mine ? "mine" : "other"}`}>
      <div className={`message-bubble ${isDeleted ? "deleted" : ""}`}>
        {/* Forwarded Tag */}
        {message.is_forwarded && !isDeleted && (
          <div className="forwarded-tag">
            <i>↪ Forwarded</i>
          </div>
        )}

        {/* Pinned Tag */}
        {message.is_pinned && !isDeleted && (
          <div className="pinned-badge" title="Pinned message">
            📌 Pinned
          </div>
        )}

        {/* Editing UI */}
        {isEditing ? (
          <div className="message-edit-form">
            <textarea
              className="message-edit-input"
              value={editVal}
              onChange={(e) => setEditVal(e.target.value)}
              rows={2}
            />
            <div className="message-edit-actions">
              <button
                type="button"
                className="edit-cancel-btn"
                onClick={onCancelEdit}
              >
                Cancel
              </button>
              <button
                type="button"
                className="edit-save-btn"
                onClick={() => onSaveEdit(message.id)}
                disabled={!editVal.trim()}
              >
                Save
              </button>
            </div>
          </div>
        ) : (
          /* Regular Message Content */
          <>
            <div className={`message-content ${isDeleted ? "deleted-text" : ""}`}>
              {message.content}
            </div>

            {/* Actions Menu */}
            {!isDeleted && (
              <MessageActionsMenu
                message={message}
                currentUserId={currentUserId}
                onViewInfo={onViewInfo}
                onTogglePin={onTogglePin}
                onForward={onForward}
                onStartEdit={onStartEdit}
                onDelete={onDelete}
                openUpwards={openUpwards}
              />
            )}
          </>
        )}

        <div className="message-meta">
          <span>
            {formatTime(message.createdAt)}
            {message.updatedAt &&
              new Date(message.updatedAt) - new Date(message.createdAt) > 1000 &&
              !isDeleted &&
              " (edited)"}
          </span>
          {renderStatus()}
        </div>
      </div>
    </div>
  );
}

export default MessageBubble;