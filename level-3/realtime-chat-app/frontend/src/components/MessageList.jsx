import { useEffect, useRef } from "react";
import MessageBubble from "./MessageBubble";

function formatDateLabel(dateStr) {
  const date = new Date(dateStr);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  const isSameDay = (a, b) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();

  if (isSameDay(date, today)) return "Today";
  if (isSameDay(date, yesterday)) return "Yesterday";

  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function MessageList({
  messages,
  currentUserId,
  loading,
  onViewInfo,
  onTogglePin,
  onForward,
  onStartEdit,
  onDelete,
  editingMessageId,
  editVal,
  setEditVal,
  onSaveEdit,
  onCancelEdit,
}) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  if (!messages || messages.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">💬</div>
        <div className="empty-state-title">No messages yet</div>
        <div className="empty-state-subtitle">
          Be the first to say hello! Send a message to start.
        </div>
      </div>
    );
  }

  // Group by date and render with separators
  const rendered = [];
  let lastDateLabel = null;

  messages.forEach((message, index) => {
    const dateLabel = message.createdAt
      ? formatDateLabel(message.createdAt)
      : null;

    if (dateLabel && dateLabel !== lastDateLabel) {
      lastDateLabel = dateLabel;
      rendered.push(
        <div key={`sep-${index}`} className="date-separator">
          <div className="date-separator-line" />
          <div className="date-separator-label">{dateLabel}</div>
          <div className="date-separator-line" />
        </div>
      );
    }

    const openUpwards = messages.length > 3 && index >= messages.length - 3;

    rendered.push(
      <MessageBubble
        key={message.id}
        message={message}
        currentUserId={currentUserId}
        onViewInfo={onViewInfo}
        onTogglePin={onTogglePin}
        onForward={onForward}
        onStartEdit={onStartEdit}
        onDelete={onDelete}
        isEditing={editingMessageId === message.id}
        editVal={editVal}
        setEditVal={setEditVal}
        onSaveEdit={onSaveEdit}
        onCancelEdit={onCancelEdit}
        openUpwards={openUpwards}
      />
    );
  });

  return (
    <div className="message-list">
      {rendered}
      <div ref={bottomRef} />
    </div>
  );
}

export default MessageList;