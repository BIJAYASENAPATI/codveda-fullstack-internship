import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import axios from "axios";

import Sidebar from "../components/Sidebar";
import MessageList from "../components/MessageList";
import MessageInput from "../components/MessageInput";
import ToastContainer from "../components/ToastContainer";
import ForwardModal from "../components/ForwardModal";
import InfoModal from "../components/InfoModal";
import DeleteConfirmModal from "../components/DeleteConfirmModal";
import UserProfileModal from "../components/UserProfileModal";
import NewChatModal from "../components/NewChatModal";

import { useAuth } from "../context/AuthContext";
import { useSocket } from "../context/SocketContext";

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:6000";

function Chat() {
  const { user, token } = useAuth();
  const { socket, connected, joinChat, leaveChat } = useSocket();

  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [chatsLoading, setChatsLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [error, setError] = useState("");
  const [typingUsers, setTypingUsers] = useState({});
  const [onlineUsers, setOnlineUsers] = useState({});
  const [notifications, setNotifications] = useState({});
  const [toasts, setToasts] = useState([]);

  // States for New Chat & Search
  const [allUsers, setAllUsers] = useState([]);
  const [newChatModalOpen, setNewChatModalOpen] = useState(false);
  const [sidebarSearchQuery, setSidebarSearchQuery] = useState("");

  // States for advanced message actions
  const [editingMessageId, setEditingMessageId] = useState(null);
  const [editVal, setEditVal] = useState("");
  const [infoMessage, setInfoMessage] = useState(null);
  const [forwardMessageObj, setForwardMessageObj] = useState(null);
  const [deleteMessageObj, setDeleteMessageObj] = useState(null);

  // States for Profile modal
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [profileModalUser, setProfileModalUser] = useState(null);
  const [profileModalIsOwn, setProfileModalIsOwn] = useState(false);
  const [deletedForMeIds, setDeletedForMeIds] = useState(() => {
    try {
      const stored = localStorage.getItem(`deleted_for_me_${user?.id}`);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const selectedChatRef = useRef(null);
  // Tracks whether the first (login) chat load has been toasted already
  const initialToastFiredRef = useRef(false);

  useEffect(() => {
    if (user?.id) {
      localStorage.setItem(`deleted_for_me_${user.id}`, JSON.stringify(deletedForMeIds));
    }
  }, [deletedForMeIds, user?.id]);

  // ========================================
  // TOAST HELPERS
  // ========================================

  const addToast = (toast) => {
    const id = Date.now() + Math.random();
    setToasts((cur) => [...cur, { ...toast, id, duration: 4500 }]);
  };

  const removeToast = (id) => {
    setToasts((cur) => cur.filter((t) => t.id !== id));
  };

  const handleToastOpen = (toast) => {
    // Find the chat and open it
    const chat = chats.find((c) => Number(c.id) === Number(toast.chat_id));
    if (chat) handleSelectChat(chat);
  };

  useEffect(() => {
    selectedChatRef.current = selectedChat;
  }, [selectedChat]);

  const authHeaders = { Authorization: `Bearer ${token}` };

  // ========================================
  // LOAD CHATS
  // ========================================

  const loadAllUsers = useCallback(async () => {
    try {
      const response = await axios.get(`${API_URL}/api/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data.success) {
        setAllUsers(response.data.data || []);
      }
    } catch (err) {
      console.error("LOAD ALL USERS ERROR:", err);
    }
  }, [token]);

  const loadChats = useCallback(async () => {
    try {
      await Promise.resolve();
      setChatsLoading(true);
      setError("");

      const response = await axios.get(`${API_URL}/api/chats`, {
        headers: authHeaders,
      });

      const data = response.data.data || [];
      setChats(data);

      // Seed notification counts from the API response (DB-accurate unread counts)
      // This runs on every load so re-login always shows correct badges
      const initialNotifications = {};
      const initialOnline = {};

      data.forEach((chat) => {
        if (chat.unreadCount && chat.unreadCount > 0) {
          initialNotifications[chat.id] = chat.unreadCount;
        }

        chat.participants?.forEach((p) => {
          if (p.user && Number(p.user_id) !== Number(user.id)) {
            initialOnline[p.user_id] = {
              isOnline: p.user.isOnline,
              lastSeen: p.user.lastSeen,
            };
          }
        });
      });

      setNotifications((prev) => ({
        ...initialNotifications,
        ...prev, // keep any live socket notifications that arrived before load finished
      }));

      setOnlineUsers((prev) => ({
        ...initialOnline,
        ...prev, // preserve any live events
      }));

      return data;
    } catch (err) {
      console.error("LOAD CHATS ERROR:", err);
      setError(
        err.response?.data?.message || "Unable to load chats"
      );
      return [];
    } finally {
      setChatsLoading(false);
    }
  }, [token]);

  const handleStartChat = async (targetUserId) => {
    try {
      // 1. Check if a DIRECT chat already exists in our chats list
      const existingChat = chats.find(
        (c) =>
          c.chat_type === "DIRECT" &&
          c.participants?.some(
            (p) => Number(p.user_id) === Number(targetUserId)
          )
      );

      if (existingChat) {
        setNewChatModalOpen(false);
        setSidebarSearchQuery("");
        handleSelectChat(existingChat);
        return;
      }

      // 2. Create the chat via backend API
      const response = await axios.post(
        `${API_URL}/api/chats`,
        {
          chat_type: "DIRECT",
          participant_ids: [targetUserId],
        },
        {
          headers: authHeaders,
        }
      );

      if (response.data.success) {
        const newChat = response.data.data;
        setNewChatModalOpen(false);
        setSidebarSearchQuery("");
        
        // Reload all chats so the new chat shows up in the sidebar
        const freshChats = await loadChats();
        
        // Find fully enriched chat from fresh list
        const matchedChat = freshChats.find(
          (c) => Number(c.id) === Number(newChat.id)
        );

        if (matchedChat) {
          handleSelectChat(matchedChat);
        } else {
          handleSelectChat(newChat);
        }
      }
    } catch (err) {
      console.error("START CHAT ERROR:", err);
      alert(err.response?.data?.message || "Failed to start new chat.");
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadChats();
    if (token) {
      loadAllUsers();
    }
  }, [loadChats, loadAllUsers, token]);

  // Restore selected chat from localStorage on page reload
  useEffect(() => {
    if (user?.id && chats.length > 0 && !selectedChat) {
      const storedChatId = localStorage.getItem(`selectedChatId_${user.id}`);
      if (storedChatId) {
        const matchedChat = chats.find(
          (c) => Number(c.id) === Number(storedChatId)
        );
        if (matchedChat) {
          handleSelectChat(matchedChat);
        }
      }
    }
  }, [chats, selectedChat, user?.id]);

  // ========================================
  // ON LOGIN: toast unread offline messages
  // Fires ONCE after the first load finishes.
  // Only shows chats with unreadCount > 0,
  // which means status != READ (DB-accurate).
  // ========================================

  useEffect(() => {
    // Still loading, or already toasted — skip
    if (chatsLoading) return;
    if (initialToastFiredRef.current) return;
    initialToastFiredRef.current = true;

    // Find chats with unread messages from others
    const unreadChats = chats.filter(
      (chat) => chat.unreadCount > 0 && chat.lastMessage
    );

    if (unreadChats.length === 0) return;

    // Stagger toasts 300ms apart so they don't all pop at once
    unreadChats.forEach((chat, index) => {
      setTimeout(() => {
        addToast({
          chat_id: chat.id,
          senderName:
            chat.lastMessage?.senderName || "Someone",
          content:
            chat.unreadCount === 1
              ? chat.lastMessage?.content || "Sent you a message"
              : `${chat.unreadCount} unread messages`,
          duration: 5000,
        });
      }, index * 300);
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chatsLoading]);

  // ========================================
  // LOAD MESSAGES
  // ========================================

  const loadMessages = useCallback(
    async (chatId) => {
      try {
        setMessagesLoading(true);
        setError("");

        const response = await axios.get(
          `${API_URL}/api/messages`,
          {
            params: { chat_id: chatId },
            headers: authHeaders,
          }
        );

        setMessages(response.data.data || []);
      } catch (err) {
        console.error("LOAD MESSAGES ERROR:", err);
        setError(
          err.response?.data?.message || "Unable to load messages"
        );
      } finally {
        setMessagesLoading(false);
      }
    },
    [token]
  );

  // ========================================
  // SELECT CHAT
  // ========================================

  const handleSelectChat = async (chat) => {
    if (selectedChat?.id === chat.id) return;

    if (selectedChat && connected) {
      leaveChat(selectedChat.id);
    }

    setSelectedChat(chat);
    if (user?.id) {
      localStorage.setItem(`selectedChatId_${user.id}`, chat.id);
    }
    setMessages([]);
    setTypingUsers((cur) => {
      const copy = { ...cur };
      delete copy[chat.id];
      return copy;
    });
    
    // Clear notifications count in state
    setNotifications((cur) => ({ ...cur, [chat.id]: 0 }));
    
    // Clear unreadCount in the chats list state
    setChats((cur) =>
      cur.map((c) =>
        c.id === chat.id ? { ...c, unreadCount: 0 } : c
      )
    );

    await loadMessages(chat.id);

    if (connected) {
      joinChat(chat.id, (response) => {
        if (!response?.success) {
          console.error("JOIN CHAT FAILED:", response);
        } else {
          // Bulk mark all messages as read
          socket.emit("mark_chat_read", { chat_id: chat.id });
        }
      });
    }
  };

  // ========================================
  // JOIN SELECTED CHAT AFTER SOCKET CONNECTS
  // ========================================

  useEffect(() => {
    if (!connected || !selectedChat) return;

    joinChat(selectedChat.id, (response) => {
      if (!response?.success) {
        console.error("JOIN CHAT FAILED:", response);
      }
    });

    return () => {
      leaveChat(selectedChat.id);
    };
  }, [connected, selectedChat?.id]);

  // ========================================
  // SOCKET EVENTS
  // ========================================

  useEffect(() => {
    if (!socket) return;

    const handleReceiveMessage = (message) => {
      const activeChat = selectedChatRef.current;

      if (
        activeChat &&
        Number(activeChat.id) === Number(message.chat_id)
      ) {
        setMessages((cur) => {
          const exists = cur.some(
            (item) => Number(item.id) === Number(message.id)
          );
          if (exists) return cur;
          return [...cur, message];
        });

        // Mark delivered + read since conversation is open
        if (Number(message.sender_id) !== Number(user.id)) {
          socket.emit("message_delivered", {
            message_id: message.id,
          });
          socket.emit("message_read", {
            message_id: message.id,
          });
        }
      }
    };

    const handleTyping = (data) => {
      if (Number(data.user_id) === Number(user.id)) return;
      setTypingUsers((cur) => ({
        ...cur,
        [data.chat_id]: data.user_id,
      }));
    };

    const handleStopTyping = (data) => {
      setTypingUsers((cur) => {
        const copy = { ...cur };
        delete copy[data.chat_id];
        return copy;
      });
    };

    const handleStatus = (data) => {
      setOnlineUsers((cur) => ({
        ...cur,
        [data.userId]: {
          isOnline: data.isOnline,
          lastSeen:
            data.lastSeen ||
            cur[data.userId]?.lastSeen ||
            null,
        },
      }));
    };

    const handleMessageStatus = (data) => {
      setMessages((cur) =>
        cur.map((message) =>
          Number(message.id) === Number(data.message_id)
            ? { ...message, status: data.status }
            : message
        )
      );
    };

    const handleChatRead = (data) => {
      // If the other participant read my messages in this chat, set my messages to READ (blue ticks)
      if (
        selectedChatRef.current &&
        Number(selectedChatRef.current.id) === Number(data.chat_id) &&
        Number(data.reader_id) !== Number(user.id)
      ) {
        setMessages((cur) =>
          cur.map((msg) =>
            Number(msg.sender_id) === Number(user.id)
              ? { ...msg, status: "READ" }
              : msg
          )
        );
      }
    };

    const handleNotification = (notification) => {
      const activeChat = selectedChatRef.current;

      if (
        activeChat &&
        Number(activeChat.id) === Number(notification.chat_id)
      ) {
        // Chat is open — don't add badge, but still refresh lastMessage in sidebar
        setChats((cur) =>
          cur.map((chat) =>
            Number(chat.id) === Number(notification.chat_id)
              ? {
                  ...chat,
                  lastMessage: {
                    content: notification.content,
                    type: "TEXT",
                    sender_id: notification.sender_id,
                    senderName: notification.senderName || null,
                    createdAt: new Date().toISOString(),
                    status: "SENT",
                  },
                }
              : chat
          )
        );
        return;
      }

      // Increment unread badge
      setNotifications((cur) => ({
        ...cur,
        [notification.chat_id]:
          (cur[notification.chat_id] || 0) + 1,
      }));

      // Update lastMessage preview in sidebar
      setChats((cur) =>
        cur.map((chat) =>
          Number(chat.id) === Number(notification.chat_id)
            ? {
                ...chat,
                unreadCount:
                  (chat.unreadCount || 0) + 1,
                lastMessage: {
                  content: notification.content,
                  type: "TEXT",
                  sender_id: notification.sender_id,
                  senderName: notification.senderName || null,
                  createdAt: new Date().toISOString(),
                  status: "SENT",
                },
              }
            : chat
        )
      );

      // 🔔 Fire the toast popup
      addToast({
        chat_id: notification.chat_id,
        senderName: notification.senderName || "Someone",
        content: notification.content || "Sent a message",
      });
    };

    const handleMessageUpdatedEvent = (data) => {
      setMessages((cur) =>
        cur.map((msg) =>
          Number(msg.id) === Number(data.id)
            ? { ...msg, content: data.content, updatedAt: data.updatedAt }
            : msg
        )
      );
    };

    const handleMessageDeletedEvent = (data) => {
      setMessages((cur) =>
        cur.map((msg) =>
          Number(msg.id) === Number(data.id)
            ? { ...msg, deleted_for_everyone: true, content: data.content }
            : msg
        )
      );
    };

    const handleMessagePinnedEvent = (data) => {
      setMessages((cur) =>
        cur.map((msg) =>
          Number(msg.id) === Number(data.id)
            ? {
                ...msg,
                is_pinned: data.is_pinned,
                pinned_by: data.pinned_by,
                pinned_at: data.pinned_at,
              }
            : msg
        )
      );
    };

    socket.on("receive_message", handleReceiveMessage);
    socket.on("typing", handleTyping);
    socket.on("stop_typing", handleStopTyping);
    socket.on("user_status", handleStatus);
    socket.on("message_status", handleMessageStatus);
    socket.on("chat_read", handleChatRead);
    socket.on("notification", handleNotification);
    socket.on("message_updated", handleMessageUpdatedEvent);
    socket.on("message_deleted", handleMessageDeletedEvent);
    socket.on("message_pinned", handleMessagePinnedEvent);

    return () => {
      socket.off("receive_message", handleReceiveMessage);
      socket.off("typing", handleTyping);
      socket.off("stop_typing", handleStopTyping);
      socket.off("user_status", handleStatus);
      socket.off("message_status", handleMessageStatus);
      socket.off("chat_read", handleChatRead);
      socket.off("notification", handleNotification);
      socket.off("message_updated", handleMessageUpdatedEvent);
      socket.off("message_deleted", handleMessageDeletedEvent);
      socket.off("message_pinned", handleMessagePinnedEvent);
    };
  }, [socket, user.id]);

  // ========================================
  // MESSAGE SENT BY CURRENT USER
  // ========================================

  const handleMessageSent = (message) => {
    setMessages((cur) => {
      const exists = cur.some(
        (item) => Number(item.id) === Number(message.id)
      );
      if (exists) return cur;
      return [...cur, message];
    });
  };

  // ========================================
  // MESSAGE INTERACTIONS ACTION HANDLERS
  // ========================================

  const handleStartEdit = (message) => {
    setEditingMessageId(message.id);
    setEditVal(message.content);
  };

  const handleSaveEdit = async (messageId) => {
    try {
      const response = await axios.put(
        `${API_URL}/api/messages/${messageId}`,
        { content: editVal },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.data.success) {
        setMessages((cur) =>
          cur.map((msg) =>
            Number(msg.id) === Number(messageId)
              ? { ...msg, content: editVal, updatedAt: new Date().toISOString() }
              : msg
          )
        );
        setEditingMessageId(null);
        setEditVal("");
      }
    } catch (err) {
      alert(err.response?.data?.message || "Failed to edit message");
    }
  };

  const handleCancelEdit = () => {
    setEditingMessageId(null);
    setEditVal("");
  };

  const handleTogglePin = async (message) => {
    try {
      const response = await axios.post(
        `${API_URL}/api/messages/${message.id}/pin`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.data.success) {
        const updated = response.data.data;
        setMessages((cur) =>
          cur.map((msg) =>
            Number(msg.id) === Number(message.id)
              ? {
                  ...msg,
                  is_pinned: updated.is_pinned,
                  pinned_by: updated.pinned_by,
                  pinned_at: updated.pinned_at,
                }
              : msg
          )
        );
      }
    } catch (err) {
      alert("Failed to toggle pin: " + (err.response?.data?.message || err.message));
    }
  };

  const handleForward = (message) => {
    setForwardMessageObj(message);
  };

  const handleConfirmForward = async (targetChatIds) => {
    if (!forwardMessageObj) return;
    try {
      await axios.post(
        `${API_URL}/api/messages/${forwardMessageObj.id}/forward`,
        { target_chat_ids: targetChatIds },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setForwardMessageObj(null);
      if (targetChatIds.includes(selectedChat?.id)) {
        await loadMessages(selectedChat.id);
      }
    } catch (err) {
      alert("Failed to forward message: " + (err.response?.data?.message || err.message));
    }
  };

  const handleDelete = (message) => {
    setDeleteMessageObj(message);
  };

  const handleConfirmDelete = async (type) => {
    if (!deleteMessageObj) return;

    if (type === "everyone") {
      try {
        await axios.delete(
          `${API_URL}/api/messages/${deleteMessageObj.id}?mode=everyone`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setMessages((cur) =>
          cur.map((msg) =>
            Number(msg.id) === Number(deleteMessageObj.id)
              ? { ...msg, deleted_for_everyone: true, content: "This message was deleted." }
              : msg
          )
        );
      } catch (err) {
        alert("Failed to delete for everyone: " + (err.response?.data?.message || err.message));
      }
    } else {
      setDeletedForMeIds((prev) => [...prev, deleteMessageObj.id]);
    }

    setDeleteMessageObj(null);
  };

  const handleViewInfo = (message) => {
    setInfoMessage(message);
  };

  const handleShowOwnProfile = () => {
    setProfileModalUser(user);
    setProfileModalIsOwn(true);
    setProfileModalOpen(true);
  };

  const handleShowOtherProfile = async () => {
    if (!selectedChat) return;

    const otherParticipant = selectedChat.participants?.find(
      (p) => Number(p.user_id) !== Number(user.id)
    );

    if (!otherParticipant) return;

    try {
      const response = await axios.get(
        `${API_URL}/api/users/${otherParticipant.user_id}`,
        {
          headers: authHeaders,
        }
      );

      if (response.data.success) {
        setProfileModalUser(response.data.data);
        setProfileModalIsOwn(false);
        setProfileModalOpen(true);
      }
    } catch (err) {
      console.error("FETCH OTHER USER PROFILE ERROR:", err);
      setProfileModalUser({
        id: otherParticipant.user_id,
        name: otherParticipant.user?.name || "Contact",
        bio: "Unable to load bio details.",
        email: "Hidden",
        role: "USER",
      });
      setProfileModalIsOwn(false);
      setProfileModalOpen(true);
    }
  };

  // ========================================
  // HELPERS
  // ========================================

  const getChatName = (chat) => {
    if (!chat) return "";
    if (chat.chat_type === "GROUP") {
      return chat.name || "Group Chat";
    }
    const otherParticipant = chat.participants?.find(
      (p) => Number(p.user_id) !== Number(user.id)
    );
    return otherParticipant?.user?.name || chat.name || `Chat ${chat.id}`;
  };

  const formatLastSeen = (value) => {
    if (!value) return "Offline";
    return (
      "Last seen " +
      new Date(value).toLocaleString("en-IN", {
        dateStyle: "short",
        timeStyle: "short",
      })
    );
  };

  // Get online status for the other participant in a DM
  const getChatStatus = (chat) => {
    if (!chat) return { isOnline: false, label: "" };

    // For group chats, just show socket connection status
    if (chat.chat_type === "GROUP") {
      return {
        isOnline: connected,
        label: connected ? "Connected" : "Connecting…",
      };
    }

    // For DM — find the other user's id from participants
    const otherParticipant = chat.participants?.find(
      (p) => Number(p.user_id) !== Number(user.id)
    );

    if (!otherParticipant) {
      return {
        isOnline: false,
        label: connected ? "Connected" : "Connecting…",
      };
    }

    const status = onlineUsers[otherParticipant.user_id];
    const isOnline = status ? status.isOnline : otherParticipant.user?.isOnline;
    const lastSeen = status ? status.lastSeen : otherParticipant.user?.lastSeen;

    if (isOnline) {
      return { isOnline: true, label: "Online" };
    }

    if (lastSeen) {
      return {
        isOnline: false,
        label: formatLastSeen(lastSeen),
      };
    }

    return { isOnline: false, label: "Offline" };
  };

  // Enrich chats with notification counts
  const chatsWithCounts = chats.map((chat) => ({
    ...chat,
    unreadCount: notifications[chat.id] || 0,
  }));

  // Filter chats by search query
  const filteredChats = chatsWithCounts.filter((chat) => {
    const name = getChatName(chat).toLowerCase();
    return name.includes(sidebarSearchQuery.toLowerCase());
  });

  // Get matching new users (excluding ourselves and those who already have a direct chat)
  const matchingNewUsers = !sidebarSearchQuery.trim()
    ? []
    : allUsers.filter((userItem) => {
        if (Number(userItem.id) === Number(user?.id)) return false;

        const name = (userItem.name || "").toLowerCase();
        const email = (userItem.email || "").toLowerCase();
        const query = sidebarSearchQuery.toLowerCase();
        const matchesQuery = name.includes(query) || email.includes(query);
        if (!matchesQuery) return false;

        // Check if a direct chat with this user already exists
        const hasChat = chats.some(
          (c) =>
            c.chat_type === "DIRECT" &&
            c.participants?.some((p) => Number(p.user_id) === Number(userItem.id))
        );
        return !hasChat;
      });

  const chatStatus = getChatStatus(selectedChat);
  const chatName = getChatName(selectedChat);

  return (
    <div className="chat-page">
      <div className="chat-container">
        <Sidebar
          chats={filteredChats}
          selectedChat={selectedChat}
          onSelectChat={handleSelectChat}
          loading={chatsLoading}
          onlineUsers={onlineUsers}
          onShowOwnProfile={handleShowOwnProfile}
          onOpenNewChatModal={() => setNewChatModalOpen(true)}
          searchQuery={sidebarSearchQuery}
          onSearchChange={setSidebarSearchQuery}
          matchingNewUsers={matchingNewUsers}
          onStartChat={handleStartChat}
        />

        <section className="chat-window">
          {!selectedChat ? (
            <div className="empty-state">
              <div className="empty-state-icon">💬</div>
              <div className="empty-state-title">
                Welcome, {user?.name?.split(" ")[0]}!
              </div>
              <div className="empty-state-subtitle">
                Select a conversation from the sidebar to start
                chatting in real-time.
              </div>
            </div>
          ) : (
            <>
              {/* ── Header ── */}
              <header className="chat-header">
                <div
                  className="chat-header-avatar"
                  onClick={handleShowOtherProfile}
                  style={{ cursor: "pointer" }}
                  title="View contact info"
                >
                  {chatName.charAt(0).toUpperCase()}
                  <span
                    className={`chat-header-status-dot ${
                      chatStatus.isOnline ? "online" : "offline"
                    }`}
                  />
                </div>

                <div
                  className="chat-header-info"
                  onClick={handleShowOtherProfile}
                  style={{ cursor: "pointer" }}
                  title="View contact info"
                >
                  <div className="chat-header-name">
                    {chatName}
                  </div>
                  <div
                    className={`chat-status ${
                      chatStatus.isOnline ? "online" : "offline"
                    }`}
                  >
                    {chatStatus.isOnline && (
                      <span
                        style={{
                          display: "inline-block",
                          width: 7,
                          height: 7,
                          borderRadius: "50%",
                          background: "var(--status-online)",
                          marginRight: 5,
                          boxShadow:
                            "0 0 6px rgba(34,197,94,0.7)",
                        }}
                      />
                    )}
                    {chatStatus.label}
                  </div>
                </div>

                {/* Socket connection indicator */}
                <div className="chat-header-badge">
                  <span
                    className={`socket-indicator ${
                      connected ? "" : "disconnected"
                    }`}
                  />
                  {connected ? "Live" : "Reconnecting"}
                </div>
              </header>

              {/* ── Error ── */}
              {error && (
                <div
                  className="error-message"
                  style={{ margin: "12px 20px 0" }}
                >
                  {error}
                </div>
              )}

              {/* ── Messages ── */}
              {/* Pinned Messages Banner */}
              {messages.filter(m => m.is_pinned && !m.deleted_for_everyone && !deletedForMeIds.includes(m.id)).length > 0 && (
                <div className="pinned-messages-banner">
                  <div className="pinned-banner-content">
                    <span className="pin-icon">📌</span>
                    <span className="pinned-text">
                      <strong>Pinned message:</strong> {
                        messages.filter(m => m.is_pinned && !m.deleted_for_everyone && !deletedForMeIds.includes(m.id))
                          .slice(-1)[0].content
                      }
                    </span>
                  </div>
                  <button
                    type="button"
                    className="unpin-banner-btn"
                    onClick={() => handleTogglePin(
                      messages.filter(m => m.is_pinned && !m.deleted_for_everyone && !deletedForMeIds.includes(m.id)).slice(-1)[0]
                    )}
                  >
                    Unpin
                  </button>
                </div>
              )}

              <MessageList
                messages={messages.filter(m => !deletedForMeIds.includes(m.id))}
                currentUserId={user.id}
                loading={messagesLoading}
                onViewInfo={handleViewInfo}
                onTogglePin={handleTogglePin}
                onForward={handleForward}
                onStartEdit={handleStartEdit}
                onDelete={handleDelete}
                editingMessageId={editingMessageId}
                editVal={editVal}
                setEditVal={setEditVal}
                onSaveEdit={handleSaveEdit}
                onCancelEdit={handleCancelEdit}
              />

              {/* ── Typing ── */}
              {typingUsers[selectedChat.id] && (
                <div className="typing-indicator">
                  <div className="typing-dots">
                    <span />
                    <span />
                    <span />
                  </div>
                  <span>Someone is typing…</span>
                </div>
              )}

              {/* ── Input ── */}
              <MessageInput
                selectedChat={selectedChat}
                socket={socket}
                onMessageSent={handleMessageSent}
              />
            </>
          )}
        </section>
      </div>

      {/* Forward Modal */}
      {forwardMessageObj && (
        <ForwardModal
          chats={chats}
          currentUserId={user.id}
          onClose={() => setForwardMessageObj(null)}
          onConfirm={handleConfirmForward}
        />
      )}

      {/* Info Modal */}
      {infoMessage && (
        <InfoModal
          message={infoMessage}
          onClose={() => setInfoMessage(null)}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deleteMessageObj && (
        <DeleteConfirmModal
          message={deleteMessageObj}
          currentUserId={user.id}
          onClose={() => setDeleteMessageObj(null)}
          onConfirm={handleConfirmDelete}
        />
      )}

      {/* User Profile Modal */}
      {profileModalOpen && (
        <UserProfileModal
          user={profileModalUser}
          isOwnProfile={profileModalIsOwn}
          onClose={() => {
            setProfileModalOpen(false);
            setProfileModalUser(null);
          }}
          onUpdate={() => {
            loadChats();
          }}
        />
      )}

      {/* New Chat Modal */}
      {newChatModalOpen && (
        <NewChatModal
          currentUserId={user.id}
          onClose={() => setNewChatModalOpen(false)}
          onStartChat={handleStartChat}
        />
      )}

      {/* Toast notification popups */}
      <ToastContainer
        toasts={toasts}
        onClose={removeToast}
        onOpen={handleToastOpen}
      />
    </div>
  );
}

export default Chat;