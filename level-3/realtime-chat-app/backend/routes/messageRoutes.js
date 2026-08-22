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


// ========================================
// PIN MESSAGE
// POST /api/messages/:id/pin
// Protected
// ========================================

router.post(
  "/:id/pin",
  authN,
  async (req, res, next) => {
    try {
      const { pinMessage } = require("../controllers/messageController");
      await pinMessage(req, res);
    } catch (err) {
      next(err);
    }
  }
);


// ========================================
// FORWARD MESSAGE
// POST /api/messages/:id/forward
// Protected
// ========================================

router.post(
  "/:id/forward",
  authN,
  async (req, res, next) => {
    try {
      const { forwardMessage } = require("../controllers/messageController");
      await forwardMessage(req, res);
    } catch (err) {
      next(err);
    }
  }
);


module.exports = router;