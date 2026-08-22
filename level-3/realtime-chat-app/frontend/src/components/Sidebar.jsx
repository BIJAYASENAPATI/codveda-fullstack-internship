import ChatList from "./ChatList";
import { useAuth } from "../context/AuthContext";

function Sidebar({
  chats,
  selectedChat,
  onSelectChat,
  loading,
  onlineUsers,
  onShowOwnProfile,
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
              <div
                className="sidebar-user-name clickable-profile"
                onClick={onShowOwnProfile}
                title="View/Edit your profile"
              >
                {user.name}
              </div>
            )}
          </div>
        </div>

        <div className="sidebar-actions">
          <button
            className="logout-button"
            onClick={logout}
            title="Logout"
          >
            Logout
          </button>
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
        />
      )}
    </aside>
  );
}

export default Sidebar;