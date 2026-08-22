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
          <div className="sidebar-title">Baat Cheet</div>
        </div>

        <div className="sidebar-actions">
          <button
            type="button"
            className="new-chat-btn"
            onClick={onOpenNewChatModal}
            title="New Chat"
          >
            <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: "5px" }}>
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            New Chat
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

      <div className="sidebar-chats-container">
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
      </div>

      {user && (
        <div className="sidebar-footer">
          <button
            type="button"
            className="sidebar-footer-profile"
            onClick={onShowOwnProfile}
            title="View/Edit your profile"
          >
            <div className="sidebar-footer-avatar">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="sidebar-footer-info">
              <div className="sidebar-footer-name">{user.name}</div>
              <div className="sidebar-footer-status">
                <span className="status-dot-mini"></span>
                Online
              </div>
            </div>
          </button>
          <button
            type="button"
            className="sidebar-footer-logout"
            onClick={logout}
            title="Logout"
          >
            <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
              <polyline points="16 17 21 12 16 7"></polyline>
              <line x1="21" y1="12" x2="9" y2="12"></line>
            </svg>
          </button>
        </div>
      )}
    </aside>
  );
}

export default Sidebar;