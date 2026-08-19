const express = require("express");

const {
  sendMessage,
  getMessages,
  getMessageById,
  updateMessage,
  deleteMessage,
} = require("../controllers/messageController");

const authN = require("../middleware/authN");

const router = express.Router();


// ========================================
// SEND MESSAGE
// POST /api/messages
// Protected
// ========================================

router.post(
  "/",
  authN,
  sendMessage
);


// ========================================
// GET CHAT MESSAGES
// GET /api/messages?chat_id=1
// Protected
// ========================================

router.get(
  "/",
  authN,
  getMessages
);


// ========================================
// GET MESSAGE BY ID
// GET /api/messages/:id
// Protected
// ========================================

router.get(
  "/:id",
  authN,
  getMessageById
);


// ========================================
// UPDATE MESSAGE
// PUT /api/messages/:id
// Sender only
// ========================================

router.put(
  "/:id",
  authN,
  updateMessage
);


// ========================================
// DELETE MESSAGE
// DELETE /api/messages/:id
// Sender or ADMIN
// ========================================

router.delete(
  "/:id",
  authN,
  deleteMessage
);


module.exports = router;