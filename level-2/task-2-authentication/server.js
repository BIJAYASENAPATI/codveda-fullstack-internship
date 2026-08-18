require("dotenv").config();

const express = require("express");
const cors = require("cors");

const {
    sequelize,
    connectDB,
} = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");


const app = express();


app.use(cors());

app.use(express.json());


app.get("/", (req, res) => {

    res.status(200).json({
        success: true,
        message: "Codveda Level 2 Authentication API is running",
    });

});


app.use("/api/auth", authRoutes);

app.use("/api/users", userRoutes);


app.use((err, req, res, next) => {

    console.error(err);

    res.status(500).json({
        success: false,
        message: "Something went wrong",
    });

});


const PORT = process.env.PORT || 5001;


const startServer = async () => {

    try {

        await connectDB();
        await sequelize.sync({ alter: true, });

        console.log( "Database tables synchronized" );


        app.listen(PORT, () => {
            console.log( `Server running on http://localhost:${PORT}` );
        });

    } catch (error) {
        console.error( "Server startup failed:", error.message );
    }
};


startServer();