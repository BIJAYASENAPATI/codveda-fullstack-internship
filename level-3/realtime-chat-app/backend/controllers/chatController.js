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
    const currentUserId = Number(req.user.id);

    // 1. Find all chat IDs this user belongs to
    const participantRows = await ChatParticipant.findAll({
      where: { user_id: currentUserId },
      attributes: ["chat_id"],
    });

    const chatIds = participantRows.map((r) => r.chat_id);

    if (chatIds.length === 0) {
      return res.status(200).json({
        success: true,
        count: 0,
        data: [],
      });
    }

    // 2. Fetch basic chat rows
    const chats = await Chat.findAll({
      where: { id: chatIds },
      order: [["updatedAt", "DESC"]],
    });

    // 3. For each chat, compute unreadCount + lastMessage in parallel
    const { Op } = db.Sequelize;
    const Message = db.Message;

    const enriched = await Promise.all(
      chats.map(async (chat) => {
        const chatObj = chat.toJSON();

        // --- participants (needed by frontend for DM status) ---
        const participants = await ChatParticipant.findAll({
          where: { chat_id: chat.id },
          attributes: ["user_id", "role"],
          include: [
            {
              model: User,
              as: "user",
              attributes: ["name", "isOnline", "lastSeen"],
            },
          ],
        });
        chatObj.participants = participants.map((p) => p.toJSON());

        // --- unread count: messages NOT sent by me, status != READ ---
        const unreadCount = await Message.count({
          where: {
            chat_id: chat.id,
            sender_id: { [Op.ne]: currentUserId },
            status: { [Op.ne]: "READ" },
          },
        });
        chatObj.unreadCount = unreadCount;

        // --- last message preview ---
        const lastMsg = await Message.findOne({
          where: { chat_id: chat.id },
          order: [["createdAt", "DESC"]],
          include: [
            {
              model: User,
              as: "sender",
              attributes: ["id", "name"],
            },
          ],
        });

        if (lastMsg) {
          chatObj.lastMessage = {
            id: lastMsg.id,
            content: lastMsg.content,
            type: lastMsg.type,
            status: lastMsg.status,
            sender_id: lastMsg.sender_id,
            senderName: lastMsg.sender?.name || null,
            createdAt: lastMsg.createdAt,
          };
        } else {
          chatObj.lastMessage = null;
        }

        return chatObj;
      })
    );

    return res.status(200).json({
      success: true,
      count: enriched.length,
      data: enriched,
    });
  } catch (error) {
    console.error("GET CHATS ERROR:", error);
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