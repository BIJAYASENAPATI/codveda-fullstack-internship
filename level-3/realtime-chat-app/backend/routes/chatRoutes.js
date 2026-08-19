const express = require("express");

const {
  createChat,
  getMyChats,
  getChatById,
  deleteChat,
} = require("../controllers/chatController");

const authN = require("../middleware/authN");

const router = express.Router();


// ========================================
// CREATE CHAT
// POST /api/chats
// Protected
// ========================================

router.post(
  "/",
  authN,
  createChat
);


// ========================================
// GET MY CHATS
// GET /api/chats
// Protected
// ========================================

router.get(
  "/",
  authN,
  getMyChats
);


// ========================================
// GET CHAT BY ID
// GET /api/chats/:id
// Protected
// ========================================

router.get(
  "/:id",
  authN,
  getChatById
);


// ========================================
// DELETE CHAT
// DELETE /api/chats/:id
// Creator or ADMIN
// ========================================

router.delete(
  "/:id",
  authN,
  deleteChat
);


module.exports = router;