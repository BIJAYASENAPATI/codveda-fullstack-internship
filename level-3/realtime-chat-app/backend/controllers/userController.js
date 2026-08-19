const db = require("../db/db");

const User = db.User;

// ===============================
// GET ALL USERS
// GET /api/users
// ===============================
const getUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: {
        exclude: ["password"],
      },
      order: [["createdAt", "DESC"]],
    });

    return res.status(200).json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (error) {
    console.error("GET USERS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// ===============================
// GET USER BY ID
// GET /api/users/:id
// ===============================
const getUserById = async (req, res) => {
  try {
    const user = await User.findByPk(
      req.params.id,
      {
        attributes: {
          exclude: ["password"],
        },
      }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error("GET USER ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// ===============================
// GET PROFILE
// GET /api/users/profile/me
// ===============================
const getProfile = async (req, res) => {
  try {
    const user = await User.findByPk(
      req.user.id,
      {
        attributes: {
          exclude: ["password"],
        },
      }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error("GET PROFILE ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// ===============================
// UPDATE PROFILE
// PUT /api/users/profile
// ===============================
const updateProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const {
      name,
      email,
      bio,
      profilePic,
    } = req.body || {};

    if (name !== undefined) {
      user.name = name;
    }

    if (email !== undefined) {
      user.email = email;
    }

    if (
      bio !== undefined &&
      Object.prototype.hasOwnProperty.call(
        user.dataValues,
        "bio"
      )
    ) {
      user.bio = bio;
    }

    if (
      profilePic !== undefined &&
      Object.prototype.hasOwnProperty.call(
        user.dataValues,
        "profilePic"
      )
    ) {
      user.profilePic = profilePic;
    }

    await user.save();

    const safeUser = user.toJSON();

    delete safeUser.password;

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: safeUser,
    });
  } catch (error) {
    console.error(
      "UPDATE PROFILE ERROR:",
      error
    );

    if (
      error.name ===
      "SequelizeUniqueConstraintError"
    ) {
      return res.status(409).json({
        success: false,
        message: "Email already exists",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// ===============================
// DELETE USER - ADMIN ONLY
// DELETE /api/users/:id
// ===============================
const deleteUser = async (req, res) => {
  try {
    const user = await User.findByPk(
      req.params.id
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    await user.destroy();

    return res.status(200).json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    console.error(
      "DELETE USER ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

module.exports = {
  getUsers,
  getUserById,
  getProfile,
  updateProfile,
  deleteUser,
};