const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");

const db = require("../db/db");

const User = db.User;
const Chat = db.Chat;
const ChatParticipant = db.ChatParticipant;
const Message = db.Message;


// ======================================================
// HELPER: CHECK WHETHER USER BELONGS TO CHAT
// ======================================================

const checkParticipant = async (chatId, userId) => {
  const participant = await ChatParticipant.findOne({
    where: {
      chat_id: chatId,
      user_id: userId,
    },
  });

  return Boolean(participant);
};


// ======================================================
// SOCKET INITIALIZATION
// ======================================================

const initSocket = (server) => {

  const io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });


  // ====================================================
  // SOCKET AUTHENTICATION
  // ====================================================

  io.use((socket, next) => {

    try {

      // Frontend sends:
      //
      // io("http://localhost:6000", {
      //   auth: { token: "JWT_TOKEN" }
      // })

      const token =
        socket.handshake.auth?.token;


      if (!token) {
        return next(
          new Error("Authentication token required")
        );
      }


      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET
      );


      socket.user = decoded;

      next();

    } catch (error) {

      console.error(
        "SOCKET AUTH ERROR:",
        error.message
      );

      next(
        new Error(
          "Invalid or expired authentication token"
        )
      );
    }

  });


  // ====================================================
  // CONNECTION
  // ====================================================

  io.on("connection", async (socket) => {

    const userId = socket.user.id;

    console.log(
      `🟢 Socket connected: user=${userId}, socket=${socket.id}`
    );


    // Personal room
    const userRoom = `user:${userId}`;

    socket.join(userRoom);


    // Update online status
    try {

      await User.update(
        {
          isOnline: true,
        },
        {
          where: {
            id: userId,
          },
        }
      );


      io.emit("user_status", {
        userId,
        isOnline: true,
      });

    } catch (error) {

      console.error(
        "ONLINE STATUS ERROR:",
        error.message
      );

    }


    // ==================================================
    // JOIN CHAT
    // ==================================================

    socket.on(
      "join_chat",
      async (data, callback) => {

        try {

          const chatId = Number(
            data?.chat_id
          );


          if (!chatId) {

            return callback?.({
              success: false,
              message: "chat_id is required",
            });

          }


          const chat = await Chat.findByPk(
            chatId
          );


          if (!chat) {

            return callback?.({
              success: false,
              message: "Chat not found",
            });

          }


          const allowed =
            await checkParticipant(
              chatId,
              userId
            );


          if (!allowed) {

            return callback?.({
              success: false,
              message:
                "You are not a participant in this chat",
            });

          }


          const room = `chat:${chatId}`;

          await socket.join(room);


          console.log(
            `👥 User ${userId} joined ${room}`
          );


          callback?.({
            success: true,
            message: "Joined chat successfully",
            chat_id: chatId,
          });

        } catch (error) {

          console.error(
            "JOIN CHAT ERROR:",
            error
          );


          callback?.({
            success: false,
            message:
              "Unable to join chat",
          });

        }

      }
    );


    // ==================================================
    // LEAVE CHAT
    // ==================================================

    socket.on(
      "leave_chat",
      async (data, callback) => {

        try {

          const chatId = Number(
            data?.chat_id
          );


          if (!chatId) {

            return callback?.({
              success: false,
              message: "chat_id is required",
            });

          }


          const room = `chat:${chatId}`;

          await socket.leave(room);


          console.log(
            `👋 User ${userId} left ${room}`
          );


          callback?.({
            success: true,
            message: "Left chat successfully",
          });

        } catch (error) {

          callback?.({
            success: false,
            message:
              "Unable to leave chat",
          });

        }

      }
    );


    // ==================================================
    // SEND MESSAGE
    // ==================================================

    socket.on(
      "send_message",
      async (data, callback) => {

        try {

          const {
            chat_id,
            content,
            type = "TEXT",
          } = data || {};


          const chatId =
            Number(chat_id);


          if (!chatId) {

            return callback?.({
              success: false,
              message: "chat_id is required",
            });

          }


          if (
            type === "TEXT" &&
            (!content ||
              !content.trim())
          ) {

            return callback?.({
              success: false,
              message:
                "Message content is required",
            });

          }


          const chat =
            await Chat.findByPk(
              chatId
            );


          if (!chat) {

            return callback?.({
              success: false,
              message:
                "Chat not found",
            });

          }


          const allowed =
            await checkParticipant(
              chatId,
              userId
            );


          if (!allowed) {

            return callback?.({
              success: false,
              message:
                "You are not a participant in this chat",
            });

          }


          // Save message to database
          const message =
            await Message.create({
              chat_id: chatId,
              sender_id: userId,
              content,
              type,
              status: "SENT",
            });


          const messageData = {
            id: message.id,
            chat_id: message.chat_id,
            sender_id:
              message.sender_id,
            content: message.content,
            type: message.type,
            status: message.status,
            createdAt:
              message.createdAt,
          };


          // Send to everyone currently in chat
          io
            .to(`chat:${chatId}`)
            .emit(
              "receive_message",
              messageData
            );


          // --------------------------------------------
          // USER-SPECIFIC NOTIFICATIONS
          // --------------------------------------------

          const participants =
            await ChatParticipant.findAll({
              where: {
                chat_id: chatId,
              },
              attributes: [
                "user_id",
              ],
            });


          participants.forEach(
            (participant) => {

              if (
                Number(
                  participant.user_id
                ) === Number(userId)
              ) {
                return;
              }


              io
                .to(
                  `user:${participant.user_id}`
                )
                .emit(
                  "notification",
                  {
                    type:
                      "NEW_MESSAGE",

                    chat_id:
                      chatId,

                    message_id:
                      message.id,

                    sender_id:
                      userId,

                    content:
                      content,
                  }
                );

            }
          );


          callback?.({
            success: true,
            message:
              "Message sent successfully",
            data: messageData,
          });

        } catch (error) {

          console.error(
            "SEND MESSAGE SOCKET ERROR:",
            error
          );


          callback?.({
            success: false,
            message:
              "Unable to send message",
          });

        }

      }
    );


    // ==================================================
    // TYPING
    // ==================================================

    socket.on(
      "typing",
      async (data) => {

        try {

          const chatId =
            Number(data?.chat_id);


          if (!chatId) {
            return;
          }


          const allowed =
            await checkParticipant(
              chatId,
              userId
            );


          if (!allowed) {
            return;
          }


          // Send to everyone except sender
          socket
            .to(`chat:${chatId}`)
            .emit(
              "typing",
              {
                chat_id:
                  chatId,

                user_id:
                  userId,
              }
            );

        } catch (error) {

          console.error(
            "TYPING ERROR:",
            error.message
          );

        }

      }
    );


    // ==================================================
    // STOP TYPING
    // ==================================================

    socket.on(
      "stop_typing",
      async (data) => {

        try {

          const chatId =
            Number(data?.chat_id);


          if (!chatId) {
            return;
          }


          const allowed =
            await checkParticipant(
              chatId,
              userId
            );


          if (!allowed) {
            return;
          }


          socket
            .to(`chat:${chatId}`)
            .emit(
              "stop_typing",
              {
                chat_id:
                  chatId,

                user_id:
                  userId,
              }
            );

        } catch (error) {

          console.error(
            "STOP TYPING ERROR:",
            error.message
          );

        }

      }
    );


    // ==================================================
    // MESSAGE DELIVERED
    // ==================================================

    socket.on(
      "message_delivered",
      async (data, callback) => {

        try {

          const messageId =
            Number(
              data?.message_id
            );


          if (!messageId) {

            return callback?.({
              success: false,
              message:
                "message_id is required",
            });

          }


          const message =
            await Message.findByPk(
              messageId
            );


          if (!message) {

            return callback?.({
              success: false,
              message:
                "Message not found",
            });

          }


          const allowed =
            await checkParticipant(
              message.chat_id,
              userId
            );


          if (!allowed) {

            return callback?.({
              success: false,
              message:
                "Access denied",
            });

          }


          // Don't downgrade READ to DELIVERED
          if (
            message.status !==
            "READ"
          ) {

            message.status =
              "DELIVERED";

            await message.save();

          }


          io
            .to(
              `chat:${message.chat_id}`
            )
            .emit(
              "message_status",
              {
                message_id:
                  message.id,

                status:
                  message.status,
              }
            );


          callback?.({
            success: true,
          });

        } catch (error) {

          console.error(
            "DELIVERED ERROR:",
            error
          );


          callback?.({
            success: false,
            message:
              "Unable to update message",
          });

        }

      }
    );


    // ==================================================
    // MESSAGE READ
    // ==================================================

    socket.on(
      "message_read",
      async (data, callback) => {

        try {

          const messageId =
            Number(
              data?.message_id
            );


          if (!messageId) {

            return callback?.({
              success: false,
              message:
                "message_id is required",
            });

          }


          const message =
            await Message.findByPk(
              messageId
            );


          if (!message) {

            return callback?.({
              success: false,
              message:
                "Message not found",
            });

          }


          const allowed =
            await checkParticipant(
              message.chat_id,
              userId
            );


          if (!allowed) {

            return callback?.({
              success: false,
              message:
                "Access denied",
            });

          }


          message.status = "READ";

          await message.save();


          io
            .to(
              `chat:${message.chat_id}`
            )
            .emit(
              "message_status",
              {
                message_id:
                  message.id,

                status: "READ",
              }
            );


          callback?.({
            success: true,
          });

        } catch (error) {

          console.error(
            "READ MESSAGE ERROR:",
            error
          );


          callback?.({
            success: false,
            message:
              "Unable to update message",
          });

        }

      }
    );


    // ==================================================
    // SOCKET ERROR
    // ==================================================

    socket.on(
      "error",
      (error) => {

        console.error(
          `Socket error for user ${userId}:`,
          error
        );

      }
    );


    // ==================================================
    // DISCONNECT
    // ==================================================

    socket.on(
      "disconnect",
      async (reason) => {

        console.log(
          `🔴 Socket disconnected: user=${userId}, reason=${reason}`
        );


        try {

          // Check whether this user still has
          // another browser/tab connected.
          const remainingSockets =
            await io
              .in(userRoom)
              .fetchSockets();


          if (
            remainingSockets.length ===
            0
          ) {

            const lastSeen =
              new Date();


            await User.update(
              {
                isOnline: false,
                lastSeen,
              },
              {
                where: {
                  id: userId,
                },
              }
            );


            io.emit(
              "user_status",
              {
                userId,
                isOnline: false,
                lastSeen,
              }
            );

          }

        } catch (error) {

          console.error(
            "DISCONNECT STATUS ERROR:",
            error
          );

        }

      }
    );

  });


  console.log(
    "✅ Socket.IO initialized"
  );


  return io;
};


module.exports = initSocket;