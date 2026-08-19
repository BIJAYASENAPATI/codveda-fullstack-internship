const db = require("../db/db");

const Message = db.Message;
const Chat = db.Chat;
const ChatParticipant = db.ChatParticipant;

// ===============================
// CHECK PARTICIPANT
// ===============================
const isParticipant = async (
  chatId,
  userId
) => {
  const participant =
    await ChatParticipant.findOne({
      where: {
        chat_id: chatId,
        user_id: userId,
      },
    });

  return Boolean(participant);
};

// ===============================
// SEND MESSAGE
// POST /api/messages
// ===============================
const sendMessage = async (req, res) => {
  try {
    const {
      chat_id,
      content,
      type = "TEXT",
    } = req.body || {};

    if (!chat_id) {
      return res.status(400).json({
        success: false,
        message: "chat_id is required",
      });
    }

    if (
      type === "TEXT" &&
      (!content || !content.trim())
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Message content is required",
      });
    }

    const chat = await Chat.findByPk(
      chat_id
    );

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: "Chat not found",
      });
    }

    const allowed =
      await isParticipant(
        chat_id,
        req.user.id
      );

    if (!allowed) {
      return res.status(403).json({
        success: false,
        message:
          "You are not a participant in this chat",
      });
    }

    const message =
      await Message.create({
        chat_id,
        sender_id: req.user.id,
        content,
        type,
      });

    return res.status(201).json({
      success: true,
      message: "Message sent successfully",
      data: message,
    });
  } catch (error) {
    console.error(
      "SEND MESSAGE ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// ===============================
// GET CHAT MESSAGES
// GET /api/messages?chat_id=1
// ===============================
const getMessages = async (
  req,
  res
) => {
  try {
    const { chat_id } = req.query;

    if (!chat_id) {
      return res.status(400).json({
        success: false,
        message: "chat_id is required",
      });
    }

    const allowed =
      await isParticipant(
        chat_id,
        req.user.id
      );

    if (!allowed) {
      return res.status(403).json({
        success: false,
        message:
          "You are not a participant in this chat",
      });
    }

    const limit = Math.min(
      Number(req.query.limit) || 50,
      100
    );

    const offset =
      Math.max(
        Number(req.query.offset) || 0,
        0
      );

    const messages =
      await Message.findAll({
        where: {
          chat_id,
        },

        order: [
          ["createdAt", "ASC"],
        ],

        limit,

        offset,
      });

    return res.status(200).json({
      success: true,
      count: messages.length,
      data: messages,
    });
  } catch (error) {
    console.error(
      "GET MESSAGES ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// ===============================
// GET MESSAGE BY ID
// GET /api/messages/:id
// ===============================
const getMessageById = async (
  req,
  res
) => {
  try {
    const message =
      await Message.findByPk(
        req.params.id
      );

    if (!message) {
      return res.status(404).json({
        success: false,
        message: "Message not found",
      });
    }

    const allowed =
      await isParticipant(
        message.chat_id,
        req.user.id
      );

    if (!allowed) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    return res.status(200).json({
      success: true,
      data: message,
    });
  } catch (error) {
    console.error(
      "GET MESSAGE ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// ===============================
// UPDATE MESSAGE
// PUT /api/messages/:id
// ===============================
const updateMessage = async (
  req,
  res
) => {
  try {
    const { content } = req.body || {};

    if (!content || !content.trim()) {
      return res.status(400).json({
        success: false,
        message: "Content is required",
      });
    }

    const message =
      await Message.findByPk(
        req.params.id
      );

    if (!message) {
      return res.status(404).json({
        success: false,
        message: "Message not found",
      });
    }

    if (
      Number(message.sender_id) !==
      Number(req.user.id)
    ) {
      return res.status(403).json({
        success: false,
        message:
          "You can only edit your own messages",
      });
    }

    message.content = content;

    await message.save();

    return res.status(200).json({
      success: true,
      message:
        "Message updated successfully",
      data: message,
    });
  } catch (error) {
    console.error(
      "UPDATE MESSAGE ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// ===============================
// DELETE MESSAGE
// DELETE /api/messages/:id
// ===============================
const deleteMessage = async (
  req,
  res
) => {
  try {
    const message =
      await Message.findByPk(
        req.params.id
      );

    if (!message) {
      return res.status(404).json({
        success: false,
        message: "Message not found",
      });
    }

    if (
      Number(message.sender_id) !==
        Number(req.user.id) &&
      req.user.role !== "ADMIN"
    ) {
      return res.status(403).json({
        success: false,
        message:
          "You are not allowed to delete this message",
      });
    }

    await message.destroy();

    return res.status(200).json({
      success: true,
      message:
        "Message deleted successfully",
    });
  } catch (error) {
    console.error(
      "DELETE MESSAGE ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

module.exports = {
  sendMessage,
  getMessages,
  getMessageById,
  updateMessage,
  deleteMessage,
};