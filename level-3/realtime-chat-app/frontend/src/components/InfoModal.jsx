import React from "react";

function InfoModal({ message, onClose }) {
  const getDeliveredTime = () => {
    if (message.status === "SENT") return "Not delivered yet";
    // Using updatedAt as a proxy for status transition time
    return new Date(message.updatedAt).toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  const getReadTime = () => {
    if (message.status !== "READ") return "Not read yet";
    // Using updatedAt as a proxy for status transition time
    return new Date(message.updatedAt).toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  return (
    <div className="forward-modal-backdrop">
      <div className="forward-modal-container info-modal-container">
        <div className="forward-modal-header">
          <h3>Message Info</h3>
          <button type="button" className="close-btn" onClick={onClose}>
            &times;
          </button>
        </div>

        <div className="forward-modal-body info-modal-body">
          <div className="info-message-preview">
            <p className="preview-label">Message Content:</p>
            <div className="preview-bubble">
              <p>{message.content}</p>
            </div>
          </div>

          <div className="info-status-list">
            <div className="status-item">
              <span className="status-icon">📤</span>
              <div className="status-details">
                <p className="status-title">Sent</p>
                <p className="status-time">
                  {new Date(message.createdAt).toLocaleString("en-IN", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </p>
              </div>
            </div>

            <div className="status-item">
              <span className="status-icon">✓✓</span>
              <div className="status-details">
                <p className="status-title">Delivered</p>
                <p className="status-time">{getDeliveredTime()}</p>
              </div>
            </div>

            <div className="status-item">
              <span className="status-icon blue-ticks">✓✓</span>
              <div className="status-details">
                <p className="status-title">Read</p>
                <p className="status-time">{getReadTime()}</p>
              </div>
            </div>
          </div>
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

export default InfoModal;
