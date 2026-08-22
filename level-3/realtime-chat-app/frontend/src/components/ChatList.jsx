function ChatList({
  chats,
  selectedChat,
  onSelectChat,
  onlineUsers = {},
  currentUserId,
}) {
  if (!chats || chats.length === 0) {
    return (
      <div className="empty-state" style={{ flex: 1 }}>
        <div className="empty-state-icon">💬</div>
        <div className="empty-state-title">No chats yet</div>
        <div className="empty-state-subtitle">
          Your conversations will appear here.
        </div>
      </div>
    );
  }

  const getChatName = (chat) => {
    if (chat.chat_type === "GROUP") {
      return chat.name || "Group Chat";
    }
    const otherParticipant = chat.participants?.find(
      (p) => Number(p.user_id) !== Number(currentUserId)
    );
    return otherParticipant?.user?.name || chat.name || `Chat ${chat.id}`;
  };

  const getInitial = (chat) => {
    const name = getChatName(chat);
    return name?.charAt(0)?.toUpperCase() || "?";
  };

  // Format preview text for the last message
  const getPreview = (chat) => {
    const lm = chat.lastMessage;
    if (!lm) return "Start a conversation";

    const isMe = Number(lm.sender_id) === Number(currentUserId);
    const prefix = isMe ? "You: " : lm.senderName ? `${lm.senderName}: ` : "";
    const body =
      lm.type === "TEXT"
        ? lm.content
        : lm.type === "IMAGE"
        ? "📷 Photo"
        : lm.type === "AUDIO"
        ? "🎵 Audio"
        : lm.type === "VIDEO"
        ? "🎥 Video"
        : "📎 File";

    return `${prefix}${body}`;
  };

  return (
    <div className="chat-list">
      {chats.map((chat) => {
        const active = selectedChat?.id === chat.id;

        // For DM chats try to detect if the other user is online
        const otherParticipant = chat.participants?.find(
          (p) => Number(p.user_id) !== Number(currentUserId)
        );
        const isOnline =
          otherParticipant &&
          (onlineUsers[otherParticipant.user_id]?.isOnline ??
            otherParticipant.user?.isOnline);

        return (
          <button
            key={chat.id}
            type="button"
            className={`chat-item ${active ? "active" : ""}`}
            onClick={() => onSelectChat(chat)}
          >
            <div className="avatar">
              {getInitial(chat)}
              {chat.chat_type !== "GROUP" && (
                <span
                  className={`avatar-status-dot ${
                    isOnline ? "online" : "offline"
                  }`}
                />
              )}
            </div>

            <div className="chat-item-content">
              <div className="chat-item-row">
                <div className="chat-item-name">
                  {getChatName(chat)}
                </div>
                {chat.lastMessage?.createdAt && (
                  <div className="chat-item-time">
                    {new Date(
                      chat.lastMessage.createdAt
                    ).toLocaleTimeString("en-IN", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                )}
              </div>

              <div className="chat-item-row">
                <div className="chat-preview">
                  {getPreview(chat)}
                </div>
                {chat.unreadCount > 0 && (
                  <span
                    className="unread-badge"
                    title={`${chat.unreadCount} unread message${
                      chat.unreadCount > 1 ? "s" : ""
                    }`}
                  >
                    {chat.unreadCount > 99 ? "99+" : chat.unreadCount}
                  </span>
                )}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}

export default ChatList;