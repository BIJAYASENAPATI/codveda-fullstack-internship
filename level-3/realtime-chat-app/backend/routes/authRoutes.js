const express = require("express");

const {
  signup,
  login,
  getMe,
} = require("../controllers/authController");

const authN = require("../middleware/authN");

const router = express.Router();


// ========================================
// SIGNUP
// POST /api/auth/signup
// Public
// ========================================

router.post(
  "/signup",
  signup
);


// ========================================
// LOGIN
// POST /api/auth/login
// Public
// ========================================

router.post(
  "/login",
  login
);


// ========================================
// GET CURRENT USER
// GET /api/auth/me
// Protected
// ========================================

router.get(
  "/me",
  authN,
  getMe
);


module.exports = router;