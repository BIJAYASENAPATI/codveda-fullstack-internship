require("dotenv").config();
const { Sequelize, DataTypes } = require("sequelize");

const fs = require("fs");
const path = require("path");

// -----------------------------------------
// SEQUELIZE CONNECTION

const useSSL =
  process.env.DB_SSL === "true";

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST || "localhost",
    dialect:
      process.env.DB_DIALECT || "mysql",
    port:
      Number(process.env.DB_PORT) || 3306,
    logging: false,

    dialectOptions: useSSL
      ? {
        ssl: {
          require: true,
          rejectUnauthorized: false,
        },
      }
      : {},

    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  }
);

// -----------------------------------------
// DB CONTAINER

const db = {};

// -----------------------------------------
// MODELS DIRECTORY

const modelsDir = path.join(
  __dirname,
  "../models"
);

// -----------------------------------------
// LOAD MODELS

if (!fs.existsSync(modelsDir)) {
  throw new Error(
    `Models directory not found: ${modelsDir}`
  );
}

fs.readdirSync(modelsDir)
  .filter((file) => {
    return (
      file.endsWith(".js") &&
      !file.startsWith(".") &&
      file !== "index.js"
    );
  })
  .forEach((file) => {
    const modelFactory =
      require(
        path.join(modelsDir, file)
      );

    const model = modelFactory(
      sequelize,
      DataTypes
    );

    db[model.name] = model;
  });

// -----------------------------------------
// MODEL ASSOCIATIONS

Object.keys(db).forEach(
  (modelName) => {
    if (
      typeof db[modelName]
        .associate === "function"
    ) {
      db[modelName].associate(db);
    }
  }
);

// -----------------------------------------
// DATABASE INITIALIZATION

const initializeDatabase =
  async () => {
    try {
      await sequelize.authenticate();

      console.log(
        "✅ Database connected successfully"
      );

      // Development only if needed:
      // await sequelize.sync({ alter: true });

      // Creates missing tables without dropping existing data
      await sequelize.sync();


      console.log(
        "✅ Models synchronized with database"
      );
    } catch (error) {
      console.error(
        "❌ Database initialization failed:",
        error
      );

      process.exit(1);
    }
  };

initializeDatabase();

// -----------------------------------------
// EXPORTS

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;