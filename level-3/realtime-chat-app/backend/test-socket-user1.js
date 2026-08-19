const { io } = require("socket.io-client");

const socket = io(
  "http://localhost:6000",
  {
    auth: {
      token:
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJyYWh1bEBleGFtcGxlLmNvbSIsInJvbGUiOiJVU0VSIiwiaWF0IjoxNzg3MTY0MDk1LCJleHAiOjE3ODcyNTA0OTV9.J6mbree5b-6EcFUzo2Dgm9G-oNpaXTeEuU0pTqgibNg",
    },
  }
);

socket.on("connect", () => {
  console.log(
    "✅ USER 1 CONNECTED:",
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
    }
  );
});

socket.on("receive_message", (message) => {
  console.log(
    "📩 MESSAGE RECEIVED:",
    message
  );

  // Mark delivered
  socket.emit(
    "message_delivered",
    {
      message_id: message.id,
    },
    (deliveredResponse) => {
      console.log(
        "✅ DELIVERED RESPONSE:",
        deliveredResponse
      );

      // Mark read after 2 seconds
      setTimeout(() => {
        socket.emit(
          "message_read",
          {
            message_id: message.id,
          },
          (readResponse) => {
            console.log(
              "👀 READ RESPONSE:",
              readResponse
            );
          }
        );
      }, 2000);
    }
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

socket.on("notification", (notification) => {
  console.log(
    "🔔 NOTIFICATION:",
    notification
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