const express = require("express");

const {
  getUsers,
  getUserById,
  getProfile,
  updateProfile,
  deleteUser,
} = require("../controllers/userController");

const authN = require("../middleware/authN");
const authZ = require("../middleware/authZ");

const router = express.Router();


// ========================================
// GET PROFILE
// GET /api/users/profile/me
// Protected
// ========================================

router.get(
  "/profile/me",
  authN,
  getProfile
);


// ========================================
// UPDATE PROFILE
// PUT /api/users/profile
// Protected
// ========================================

router.put(
  "/profile",
  authN,
  updateProfile
);


// ========================================
// GET ALL USERS
// GET /api/users
// Protected
// ========================================

router.get(
  "/",
  authN,
  getUsers
);


// ========================================
// GET USER BY ID
// GET /api/users/:id
// Protected
// ========================================

router.get(
  "/:id",
  authN,
  getUserById
);


// ========================================
// DELETE USER
// DELETE /api/users/:id
// ADMIN ONLY
// ========================================

router.delete(
  "/:id",
  authN,
  authZ("ADMIN"),
  deleteUser
);


module.exports = router;