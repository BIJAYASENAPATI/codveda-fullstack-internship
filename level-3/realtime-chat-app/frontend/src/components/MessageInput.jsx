import { useRef, useState } from "react";

function MessageInput({ selectedChat, socket, onMessageSent }) {
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const typingTimeoutRef = useRef(null);

  const handleChange = (event) => {
    const value = event.target.value;
    setMessage(value);

    if (!socket || !selectedChat) return;

    socket.emit("typing", { chat_id: selectedChat.id });

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("stop_typing", { chat_id: selectedChat.id });
    }, 1200);
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSubmit(event);
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const content = message.trim();

    if (!content || !socket || !selectedChat || sending) return;

    setSending(true);

    socket.emit(
      "send_message",
      { chat_id: selectedChat.id, content, type: "TEXT" },
      (response) => {
        setSending(false);

        if (!response?.success) {
          console.error("SEND MESSAGE ERROR:", response?.message);
          return;
        }

        setMessage("");

        socket.emit("stop_typing", { chat_id: selectedChat.id });

        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
        }

        if (response.data && onMessageSent) {
          onMessageSent(response.data);
        }
      }
    );
  };

  return (
    <div className="message-input-wrapper">
      <form className="message-form" onSubmit={handleSubmit}>
        <input
          className="message-input"
          type="text"
          placeholder="Type a message… (Enter to send)"
          value={message}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          disabled={!selectedChat || sending}
          autoComplete="off"
        />

        <button
          className="send-button"
          type="submit"
          disabled={!message.trim() || !selectedChat || sending}
          title="Send message"
        >
          {sending ? (
            /* mini spinner */
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <circle cx="12" cy="12" r="9" strokeOpacity="0.3" />
              <path d="M12 3a9 9 0 0 1 9 9" />
            </svg>
          ) : (
            /* paper plane */
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M3.478 2.405a.75.75 0 0 0-.926.94l2.432 7.905H13.5a.75.75 0 0 1 0 1.5H4.984l-2.432 7.905a.75.75 0 0 0 .926.94 60.519 60.519 0 0 0 18.445-8.986.75.75 0 0 0 0-1.218A60.517 60.517 0 0 0 3.478 2.405Z" />
            </svg>
          )}
        </button>
      </form>
    </div>
  );
}

export default MessageInput;