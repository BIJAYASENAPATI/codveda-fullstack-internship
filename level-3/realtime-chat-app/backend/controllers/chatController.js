const db = require("../db/db");

const Chat = db.Chat;
const ChatParticipant = db.ChatParticipant;
const User = db.User;

// ===============================
// CREATE CHAT
// POST /api/chats
// ===============================
const createChat = async (req, res) => {
  const transaction =
    await db.sequelize.transaction();

  try {
    const {
      name,
      chat_type = "DIRECT",
      participant_ids = [],
    } = req.body || {};

    if (
      !Array.isArray(participant_ids)
    ) {
      await transaction.rollback();

      return res.status(400).json({
        success: false,
        message:
          "participant_ids must be an array",
      });
    }

    const userIds = [
      ...new Set([
        req.user.id,
        ...participant_ids,
      ]),
    ];

    if (userIds.length < 2) {
      await transaction.rollback();

      return res.status(400).json({
        success: false,
        message:
          "At least one other participant is required",
      });
    }

    const users = await User.findAll({
      where: {
        id: userIds,
      },
      transaction,
    });

    if (users.length !== userIds.length) {
      await transaction.rollback();

      return res.status(400).json({
        success: false,
        message:
          "One or more participants do not exist",
      });
    }

    const chat = await Chat.create(
      {
        name:
          chat_type === "GROUP"
            ? name
            : null,

        chat_type,

        created_by: req.user.id,
      },
      {
        transaction,
      }
    );

    const participantRecords =
      userIds.map((userId) => ({
        chat_id: chat.id,

        user_id: userId,

        role:
          userId === req.user.id
            ? "ADMIN"
            : "MEMBER",
      }));

    await ChatParticipant.bulkCreate(
      participantRecords,
      {
        transaction,
      }
    );

    await transaction.commit();

    return res.status(201).json({
      success: true,
      message: "Chat created successfully",
      data: chat,
    });
  } catch (error) {
    await transaction.rollback();

    console.error(
      "CREATE CHAT ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// ===============================
// GET MY CHATS
// GET /api/chats
// ===============================
const getMyChats = async (req, res) => {
  try {
    const participantRows =
      await ChatParticipant.findAll({
        where: {
          user_id: req.user.id,
        },
        attributes: ["chat_id"],
      });

    const chatIds = participantRows.map(
      (item) => item.chat_id
    );

    if (chatIds.length === 0) {
      return res.status(200).json({
        success: true,
        count: 0,
        data: [],
      });
    }

    const chats = await Chat.findAll({
      where: {
        id: chatIds,
      },
      order: [["createdAt", "DESC"]],
    });

    return res.status(200).json({
      success: true,
      count: chats.length,
      data: chats,
    });
  } catch (error) {
    console.error(
      "GET CHATS ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// ===============================
// GET CHAT BY ID
// GET /api/chats/:id
// ===============================
const getChatById = async (req, res) => {
  try {
    const chatId = req.params.id;

    const participant =
      await ChatParticipant.findOne({
        where: {
          chat_id: chatId,
          user_id: req.user.id,
        },
      });

    if (!participant) {
      return res.status(403).json({
        success: false,
        message:
          "You are not a participant in this chat",
      });
    }

    const chat = await Chat.findByPk(
      chatId
    );

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: "Chat not found",
      });
    }

    const participants =
      await ChatParticipant.findAll({
        where: {
          chat_id: chatId,
        },
      });

    return res.status(200).json({
      success: true,
      data: {
        chat,
        participants,
      },
    });
  } catch (error) {
    console.error(
      "GET CHAT ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// ===============================
// DELETE CHAT
// DELETE /api/chats/:id
// ===============================
const deleteChat = async (req, res) => {
  const transaction =
    await db.sequelize.transaction();

  try {
    const chat = await Chat.findByPk(
      req.params.id,
      {
        transaction,
      }
    );

    if (!chat) {
      await transaction.rollback();

      return res.status(404).json({
        success: false,
        message: "Chat not found",
      });
    }

    if (
      Number(chat.created_by) !==
        Number(req.user.id) &&
      req.user.role !== "ADMIN"
    ) {
      await transaction.rollback();

      return res.status(403).json({
        success: false,
        message:
          "You are not allowed to delete this chat",
      });
    }

    await ChatParticipant.destroy({
      where: {
        chat_id: chat.id,
      },
      transaction,
    });

    if (db.Message) {
      await db.Message.destroy({
        where: {
          chat_id: chat.id,
        },
        transaction,
      });
    }

    await chat.destroy({
      transaction,
    });

    await transaction.commit();

    return res.status(200).json({
      success: true,
      message: "Chat deleted successfully",
    });
  } catch (error) {
    await transaction.rollback();

    console.error(
      "DELETE CHAT ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

module.exports = {
  createChat,
  getMyChats,
  getChatById,
  deleteChat,
};