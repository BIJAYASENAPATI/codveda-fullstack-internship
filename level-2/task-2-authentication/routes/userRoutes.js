const express = require("express");

const User = require("../models/User");

const {
    authenticateToken,
    authorizeRoles,
} = require("../middleware/authMiddleware");


const router = express.Router();


// Protected: USER or ADMIN
router.get(
    "/",
    authenticateToken,
    async (req, res) => {

        try {

            const users = await User.findAll({
                attributes: {
                    exclude: ["password"],
                },
            });


            res.status(200).json({
                success: true,
                data: users,
            });

        } catch (error) {

            console.error(error);

            res.status(500).json({
                success: false,
                message: "Internal server error",
            });
        }
    }
);


// Protected: ADMIN only
router.delete(
    "/:id",
    authenticateToken,
    authorizeRoles("ADMIN"),
    async (req, res) => {

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


            res.status(200).json({
                success: true,
                message: "User deleted successfully",
            });

        } catch (error) {

            console.error(error);

            res.status(500).json({
                success: false,
                message: "Internal server error",
            });
        }
    }
);


module.exports = router;