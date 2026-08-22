import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { io } from "socket.io-client";

import {
  useAuth,
} from "./AuthContext";

const SocketContext =
  createContext(null);

const SOCKET_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:6000";

export function SocketProvider({
  children,
}) {
  const {
    token,
    user,
  } = useAuth();

  const [socket, setSocket] =
    useState(null);

  const [
    connected,
    setConnected,
  ] = useState(false);

  const [
    socketError,
    setSocketError,
  ] = useState("");

  // ========================================
  // CONNECT / DISCONNECT SOCKET
  // ========================================

  useEffect(() => {
    if (!token || !user) {
      setConnected(false);

      return;
    }

    const newSocket = io(
      SOCKET_URL,
      {
        auth: {
          token,
        },

        transports: [
          "websocket",
          "polling",
        ],
      }
    );

    setSocket(newSocket);

    // ========================================
    // CONNECT
    // ========================================

    newSocket.on(
      "connect",
      () => {
        console.log(
          "Socket connected:",
          newSocket.id
        );

        setConnected(true);
        setSocketError("");
      }
    );

    // ========================================
    // CONNECT ERROR
    // ========================================

    newSocket.on(
      "connect_error",
      (error) => {
        console.error(
          "Socket connection error:",
          error.message
        );

        setConnected(false);

        setSocketError(
          error.message
        );
      }
    );

    // ========================================
    // DISCONNECT
    // ========================================

    newSocket.on(
      "disconnect",
      (reason) => {
        console.log(
          "Socket disconnected:",
          reason
        );

        setConnected(false);
      }
    );

    // ========================================
    // CLEANUP
    // ========================================

    return () => {
      newSocket.removeAllListeners();
      newSocket.disconnect();

      setSocket(null);
      setConnected(false);
    };
  }, [token, user?.id]);

  // ========================================
  // JOIN CHAT
  // ========================================

  const joinChat = (
    chatId,
    callback
  ) => {
    if (
      !socket ||
      !connected ||
      !chatId
    ) {
      return;
    }

    socket.emit(
      "join_chat",
      {
        chat_id:
          Number(chatId),
      },
      callback
    );
  };

  // ========================================
  // LEAVE CHAT
  // ========================================

  const leaveChat = (
    chatId,
    callback
  ) => {
    if (
      !socket ||
      !connected ||
      !chatId
    ) {
      return;
    }

    socket.emit(
      "leave_chat",
      {
        chat_id:
          Number(chatId),
      },
      callback
    );
  };

  const value = useMemo(
    () => ({
      socket,
      connected,
      socketError,
      joinChat,
      leaveChat,
    }),
    [
      socket,
      connected,
      socketError,
    ]
  );

  return (
    <SocketContext.Provider
      value={value}
    >
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  const context =
    useContext(SocketContext);

  if (!context) {
    throw new Error(
      "useSocket must be used inside SocketProvider"
    );
  }

  return context;
}