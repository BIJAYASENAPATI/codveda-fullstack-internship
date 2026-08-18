const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const User = require("../models/User");


const signup = async (req, res) => {

    try {

        const {
            name,
            email,
            age,
            password,
        } = req.body;


        if (!name || !email || !age || !password) {

            return res.status(400).json({
                success: false,
                message: "All fields are required",
            });

        }


        const existingUser = await User.findOne({
            where: { email },
        });


        if (existingUser) {

            return res.status(409).json({
                success: false,
                message: "Email already registered",
            });

        }


        const hashedPassword = await bcrypt.hash(
            password,
            10
        );


        const user = await User.create({
            name,
            email,
            age,
            password: hashedPassword,
            role: "USER",
        });


        return res.status(201).json({
            success: true,
            message: "User registered successfully",
            data: {
                id: user.id,
                name: user.name,
                email: user.email,
                age: user.age,
                role: user.role,
            },
        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};


const login = async (req, res) => {

    try {

        const {
            email,
            password,
        } = req.body;


        if (!email || !password) {

            return res.status(400).json({
                success: false,
                message: "Email and password are required",
            });

        }


        const user = await User.findOne({
            where: { email },
        });


        if (!user) {

            return res.status(401).json({
                success: false,
                message: "Invalid email or password",
            });

        }


        const passwordMatch = await bcrypt.compare(
            password,
            user.password
        );


        if (!passwordMatch) {

            return res.status(401).json({
                success: false,
                message: "Invalid email or password",
            });

        }


        const token = jwt.sign(
            {
                id: user.id,
                email: user.email,
                role: user.role,
            },
            process.env.JWT_SECRET,
            {
                expiresIn: process.env.JWT_EXPIRES_IN || "1d",
            }
        );


        return res.status(200).json({
            success: true,
            message: "Login successful",
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                age: user.age,
                role: user.role,
            },
        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};


module.exports = {
    signup,
    login,
};