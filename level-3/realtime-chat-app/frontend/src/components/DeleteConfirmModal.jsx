import React from "react";

function DeleteConfirmModal({ message, currentUserId, onClose, onConfirm }) {
  const isSender = Number(message.sender_id) === Number(currentUserId);

  return (
    <div className="forward-modal-backdrop">
      <div className="forward-modal-container delete-confirm-modal">
        <div className="forward-modal-header">
          <h3>Delete Message?</h3>
          <button type="button" className="close-btn" onClick={onClose}>
            &times;
          </button>
        </div>

        <div className="forward-modal-body">
          <p className="delete-instruction">
            Are you sure you want to delete this message?
          </p>
          <div className="delete-preview-bubble">
            <p>{message.content}</p>
          </div>
        </div>

        <div className="forward-modal-footer delete-modal-footer">
          <button
            type="button"
            className="modal-cancel-btn"
            onClick={onClose}
          >
            Cancel
          </button>

          <button
            type="button"
            className="modal-submit-btn delete-me-btn"
            onClick={() => onConfirm("me")}
          >
            Delete for me
          </button>

          {isSender && (
            <button
              type="button"
              className="modal-submit-btn delete-everyone-btn"
              onClick={() => onConfirm("everyone")}
            >
              Delete for everyone
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default DeleteConfirmModal;
