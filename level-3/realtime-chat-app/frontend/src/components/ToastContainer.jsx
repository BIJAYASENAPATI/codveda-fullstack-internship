import { useEffect, useRef } from "react";

/**
 * A single toast notification item.
 * Auto-dismisses after `duration` ms.
 */
function ToastItem({ toast, onClose, onOpen }) {
  const timerRef = useRef(null);

  useEffect(() => {
    timerRef.current = setTimeout(() => {
      onClose(toast.id);
    }, toast.duration || 4500);

    return () => clearTimeout(timerRef.current);
  }, [toast.id]);

  const handleClick = () => {
    clearTimeout(timerRef.current);
    onOpen(toast);
    onClose(toast.id);
  };

  const initial = (toast.senderName || "?")
    .charAt(0)
    .toUpperCase();

  return (
    <div
      className="toast-item"
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && handleClick()}
      title="Click to open chat"
    >
      {/* Close button */}
      <button
        className="toast-close"
        onClick={(e) => {
          e.stopPropagation();
          onClose(toast.id);
        }}
        title="Dismiss"
      >
        ×
      </button>

      {/* Avatar */}
      <div className="toast-avatar">{initial}</div>

      {/* Content */}
      <div className="toast-content">
        <div className="toast-sender">{toast.senderName || "Someone"}</div>
        <div className="toast-message">{toast.content}</div>
      </div>

      {/* Progress bar */}
      <div
        className="toast-progress"
        style={{ animationDuration: `${toast.duration || 4500}ms` }}
      />
    </div>
  );
}

/**
 * Container that renders all active toasts.
 * Place once near the root.
 */
function ToastContainer({ toasts, onClose, onOpen }) {
  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="toast-container">
      {toasts.map((toast) => (
        <ToastItem
          key={toast.id}
          toast={toast}
          onClose={onClose}
          onOpen={onOpen}
        />
      ))}
    </div>
  );
}

export default ToastContainer;
