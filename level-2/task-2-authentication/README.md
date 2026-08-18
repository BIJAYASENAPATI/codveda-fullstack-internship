# Level 2 - Task 2: Authentication and Authorization

## Codveda Technologies Full Stack Development Internship

This project implements user authentication and authorization using Node.js, Express, bcrypt, JWT, Sequelize, and MySQL.

## Task Objective

Implement signup and login functionality using JWT and secure backend routes based on user roles.

## Features

- User registration
- User login
- Password hashing using bcrypt
- JWT token generation
- JWT authentication middleware
- Protected routes
- Role-based authorization
- USER and ADMIN roles
- MySQL database integration
- Sequelize ORM
- Environment variable configuration

## Technologies Used

- Node.js
- Express.js
- MySQL
- Sequelize
- bcrypt
- JSON Web Token (JWT)
- dotenv
- CORS

## Project Structure

```text
task-2-authentication/
├── config/
│   └── db.js
├── controllers/
│   └── ...
├── middleware/
│   └── ...
├── models/
│   └── ...
├── routes/
│   └── ...
├── .env
├── .gitignore
├── package.json
├── package-lock.json
└── server.js