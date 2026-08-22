require("dotenv").config();

const express = require("express");
const cors = require("cors");
const multer = require("multer");
const http = require("http");

const app = express();

// DATABASE

require("./db/db");

// ROUTES

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const chatRoutes = require("./routes/chatRoutes");
const messageRoutes = require("./routes/messageRoutes");

// MIDDLEWARE

const FRONTEND_URL =
  process.env.FRONTEND_URL ||
  "http://localhost:5173";

app.use(
  cors({
    origin: [FRONTEND_URL, "http://localhost:5174", "http://localhost:3000"],
    credentials: true,
  })
);

app.use(express.json());

app.use(
  express.urlencoded({
    extended: true,
  })
);


// TEST ROUTE


app.get("/", (req, res) => {
  return res.status(200).json({
    success: true,
    status: "ok",
    message: "Chat app API is running",
  });
});


// API ROUTES

app.use(
  "/api/auth",
  authRoutes
);

app.use(
  "/api/users",
  userRoutes
);

app.use(
  "/api/chats",
  chatRoutes
);

app.use(
  "/api/messages",
  messageRoutes
);


// ========================================
// 404
// ========================================

app.use((req, res) => {
  return res.status(404).json({
    success: false,
    message: "Route not found",
  });
});


// ========================================
// ERROR HANDLER
// ========================================

app.use((err, req, res, next) => {
  console.error(
    "GLOBAL ERROR:",
    err
  );

  if (
    err instanceof multer.MulterError
  ) {
    if (
      err.code ===
      "LIMIT_FILE_SIZE"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "File too large. Maximum allowed size is 50 MB.",
      });
    }

    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }

  return res
    .status(err.status || 500)
    .json({
      success: false,
      message:
        err.message ||
        "Internal server error",
    });
});


// ========================================
// HTTP + SOCKET.IO
// ========================================

const PORT =
  process.env.PORT || 6000;

const server =
  http.createServer(app);

const initSocket = require("./socket");
const io = initSocket(server);
app.set("io", io);


// server.listen(PORT, () => {
//   console.log(
//     `🚀 Server (HTTP + Socket.IO) running on http://localhost:${PORT}`
//   );
// });


server.listen(PORT, "0.0.0.0", () => {
  console.log(
    `🚀 Server (HTTP + Socket.IO) running on 0.0.0.0:${PORT}`
  );
});