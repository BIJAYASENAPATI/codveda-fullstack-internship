require("dotenv").config();

const { Sequelize } = require("sequelize");

const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
        host: process.env.DB_HOST,
        dialect: process.env.DB_DIALECT,
        logging: false,
    }
);


const connectDB = async () => {

    try {

        await sequelize.authenticate();

        console.log("MySQL database connected successfully");

    } catch (error) {

        console.error(
            "Database connection failed:",
            error.message
        );

        throw error;
    }
};


module.exports = {
    sequelize,
    connectDB,
};