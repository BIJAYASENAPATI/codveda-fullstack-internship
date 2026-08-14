const express = require("express");
const router = express.Router();

const User = require("../models/User");

// ========================================
// CREATE USER
// POST /api/users
// ========================================
router.post("/", async (req, res) => {
    try {
        const { name, email, age } = req.body;

        // Basic validation
        if (!name || !email || age === undefined) {
            return res.status(400).json({
                success: false,
                message: "Name, email and age are required",
            });
        }

        const user = await User.create({
            name,
            email,
            age,
        });

        return res.status(201).json({
            success: true,
            message: "User created successfully",
            data: user,
        });
    } catch (error) {
        console.error(error);

        if (error.name === "SequelizeUniqueConstraintError") {
            return res.status(400).json({
                success: false,
                message: "Email already exists",
            });
        }

        if (error.name === "SequelizeValidationError") {
            return res.status(400).json({
                success: false,
                message: error.errors[0].message,
            });
        }

        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
});

// ========================================
// GET ALL USERS
// GET /api/users
// ========================================
router.get("/", async (req, res) => {
    try {
        const users = await User.findAll({
            order: [["id", "ASC"]],
        });

        return res.status(200).json({
            success: true,
            count: users.length,
            data: users,
        });
    } catch (error) {
        console.error(error);

        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
});

// ========================================
// GET USER BY ID
// GET /api/users/:id
// ========================================
router.get("/:id", async (req, res) => {
    try {
        const { id } = req.params;

        const user = await User.findByPk(id);

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
        console.error(error);

        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
});

// ========================================
// UPDATE USER
// PUT /api/users/:id
// ========================================
router.put("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email, age } = req.body;

        const user = await User.findByPk(id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        if (!name || !email || age === undefined) {
            return res.status(400).json({
                success: false,
                message: "Name, email and age are required",
            });
        }

        await user.update({
            name,
            email,
            age,
        });

        return res.status(200).json({
            success: true,
            message: "User updated successfully",
            data: user,
        });
    } catch (error) {
        console.error(error);

        if (error.name === "SequelizeUniqueConstraintError") {
            return res.status(400).json({
                success: false,
                message: "Email already exists",
            });
        }

        if (error.name === "SequelizeValidationError") {
            return res.status(400).json({
                success: false,
                message: error.errors[0].message,
            });
        }

        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
});

// ========================================
// DELETE USER
// DELETE /api/users/:id
// ========================================
router.delete("/:id", async (req, res) => {
    try {
        const { id } = req.params;

        const user = await User.findByPk(id);

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
        console.error(error);

        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
});

module.exports = router;