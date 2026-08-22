import ChatList from "./ChatList";
import { useAuth } from "../context/AuthContext";

function Sidebar({
  chats,
  selectedChat,
  onSelectChat,
  loading,
  onlineUsers,
  onShowOwnProfile,
  onOpenNewChatModal,
  searchQuery = "",
  onSearchChange = () => {},
  matchingNewUsers = [],
  onStartChat = () => {},
}) {
  const { user, logout } = useAuth();

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-brand">
          <div className="sidebar-brand-icon">💬</div>
          <div>
            <div className="sidebar-title">Baat Cheet</div>
            {user && (
              <button
                type="button"
                className="sidebar-user-name clickable-profile"
                onClick={onShowOwnProfile}
                title="View/Edit your profile"
              >
                {user.name}
              </button>
            )}
          </div>
        </div>

        <div className="sidebar-actions">
          <button
            type="button"
            className="new-chat-button"
            onClick={onOpenNewChatModal}
            title="New Chat"
          >
            New Chat
          </button>
          <button
            className="logout-button"
            onClick={logout}
            title="Logout"
          >
            Logout
          </button>
        </div>
      </div>

      <div className="sidebar-search-wrapper">
        <div className="sidebar-search-container">
          <span className="sidebar-search-icon">🔍</span>
          <input
            type="text"
            className="sidebar-search-input"
            placeholder="Search or start new chat..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
        </div>
      ) : (
        <ChatList
          chats={chats}
          selectedChat={selectedChat}
          onSelectChat={onSelectChat}
          onlineUsers={onlineUsers}
          currentUserId={user?.id}
          matchingNewUsers={matchingNewUsers}
          onStartChat={onStartChat}
        />
      )}
    </aside>
  );
}

export default Sidebar;