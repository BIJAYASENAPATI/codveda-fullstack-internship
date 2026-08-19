const { io } = require("socket.io-client");



const socket = io(
  "http://localhost:6000",
  {
    auth: {
      token:
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MiwiZW1haWwiOiJhbWl0QGV4YW1wbGUuY29tIiwicm9sZSI6IlVTRVIiLCJpYXQiOjE3ODcxNjQxNDgsImV4cCI6MTc4NzI1MDU0OH0.ltyGFkaRmJmb13uhwu4fcOJDHdYgMuddD0wYkfr-rA0",
    },
  }
);





socket.on("connect", () => {
  console.log(
    "✅ USER 2 CONNECTED:",
    socket.id
  );

  socket.emit(
    "join_chat",
    {
      chat_id: 1,
    },
    (response) => {
      console.log(
        "JOIN RESPONSE:",
        response
      );

      if (!response?.success) {
        return;
      }

      // Typing
      setTimeout(() => {
        console.log("Sending typing event...");

        socket.emit(
          "typing",
          {
            chat_id: 1,
          }
        );
      }, 2000);

      // Stop typing
      setTimeout(() => {
        console.log("Sending stop_typing event...");

        socket.emit(
          "stop_typing",
          {
            chat_id: 1,
          }
        );
      }, 4000);

      // Send message
      setTimeout(() => {
        console.log("Sending message...");

        socket.emit(
          "send_message",
          {
            chat_id: 1,
            content:
              "Hello Rahul! This is a real-time Socket.IO message.",
            type: "TEXT",
          },
          (sendResponse) => {
            console.log(
              "SEND RESPONSE:",
              sendResponse
            );
          }
        );
      }, 5000);
    }
  );
});

socket.on("receive_message", (message) => {
  console.log(
    "📩 MESSAGE RECEIVED:",
    message
  );
});

socket.on("notification", (notification) => {
  console.log(
    "🔔 NOTIFICATION:",
    notification
  );
});

socket.on("typing", (data) => {
  console.log(
    `⌨️ User ${data.user_id} is typing...`
  );
});

socket.on("stop_typing", (data) => {
  console.log(
    `🛑 User ${data.user_id} stopped typing`
  );
});

socket.on("message_status", (data) => {
  console.log(
    "✓ MESSAGE STATUS:",
    data
  );
});

socket.on("user_status", (data) => {
  console.log(
    "👤 USER STATUS:",
    data
  );
});

socket.on("connect_error", (error) => {
  console.error(
    "❌ CONNECTION ERROR:",
    error.message
  );
});