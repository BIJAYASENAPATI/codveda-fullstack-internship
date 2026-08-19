# Level 3 - Realtime Chat Application Backend

## Codveda Technologies Full Stack Development Internship

This project is the backend implementation for a real-time full-stack chat application built as part of **Level 3** of the Codveda Technologies Full Stack Development Internship.

It includes REST APIs, authentication, authorization, MySQL database integration, and real-time communication using Socket.IO.

## Features

### Authentication and Authorization

* User signup
* User login
* Password hashing using bcrypt
* JWT authentication
* Protected API routes
* Role-based authorization
* USER and ADMIN roles

### User Management

* Get current user
* Get all users
* Get user by ID
* Update profile
* Online/offline status
* Last seen tracking

### Chat Management

* Create chat
* Get user chats
* Get chat by ID
* Delete chat
* Chat participants

### Message Management

* Send message
* Get messages
* Get message by ID
* Update message
* Delete message
* Message status:

  * SENT
  * DELIVERED
  * READ

### Real-Time Features

Implemented using **Socket.IO**:

* Real-time user connection
* JWT socket authentication
* Join chat room
* Leave chat room
* Send messages in real time
* Receive messages instantly
* Typing indicator
* Stop typing indicator
* User-specific notifications
* Online/offline status
* Last seen
* Message delivered status
* Message read status
* Connection and disconnection handling

## Technologies Used

* Node.js
* Express.js
* MySQL
* Sequelize ORM
* Socket.IO
* JSON Web Token
* bcryptjs
* Multer
* dotenv
* CORS
* Postman

## Project Structure

```text
backend/
│
├── controllers/
│   ├── authController.js
│   ├── userController.js
│   ├── chatController.js
│   └── messageController.js
│
├── db/
│   └── db.js
│
├── middleware/
│   ├── authN.js
│   ├── authZ.js
│   └── upload.js
│
├── models/
│   ├── User.js
│   ├── Chat.js
│   ├── ChatParticipant.js
│   ├── Message.js
│   ├── FriendRequest.js
│   ├── BlockedUser.js
│   └── MessageReaction.js
│
├── routes/
│   ├── authRoutes.js
│   ├── userRoutes.js
│   ├── chatRoutes.js
│   └── messageRoutes.js
│
├── socket/
│   └── index.js
│
├── .env
├── .gitignore
├── package.json
├── package-lock.json
├── README.md
└── server.js
```

## Environment Variables

Create a `.env` file inside the backend folder.

```env
PORT=6000

DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=codveda_level3_chat
DB_DIALECT=mysql

JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=1d
```

Do not upload `.env` to GitHub.

## Installation

Navigate to the backend folder:

```bash
cd level-3/realtime-chat-app/backend
```

Install dependencies:

```bash
npm install
```

## Run the Backend

Development mode:

```bash
npm run dev
```

Or:

```bash
node server.js
```

The backend runs on:

```text
http://localhost:6000
```

## Main REST API Routes

### Authentication

```text
POST /api/auth/signup
POST /api/auth/login
GET  /api/auth/me
```

### Users

```text
GET    /api/users
GET    /api/users/:id
GET    /api/users/profile/me
PUT    /api/users/profile
DELETE /api/users/:id
```

### Chats

```text
POST   /api/chats
GET    /api/chats
GET    /api/chats/:id
DELETE /api/chats/:id
```

### Messages

```text
POST   /api/messages
GET    /api/messages?chat_id=:id
GET    /api/messages/:id
PUT    /api/messages/:id
DELETE /api/messages/:id
```

## Socket.IO Events

### Client to Server

```text
join_chat
leave_chat
send_message
typing
stop_typing
message_delivered
message_read
```

### Server to Client

```text
receive_message
notification
user_status
typing
stop_typing
message_status
```

## Socket.IO Authentication

The Socket.IO connection requires a JWT token.

Example:

```js
io("http://localhost:6000", {
  auth: {
    token: "YOUR_JWT_TOKEN"
  }
});
```

## Testing

The backend was tested using Postman and Socket.IO clients.

Tested functionality includes:

* Signup
* Login
* JWT authentication
* Protected routes
* Role-based access
* Chat creation
* Message sending
* Message history
* Socket connection
* Join chat
* Typing indicator
* Real-time messages
* Notifications
* Message delivered status
* Message read status
* Online/offline tracking
* Last seen tracking

## Security

* Passwords are hashed before database storage
* JWT is required for protected routes
* Socket.IO authentication also uses JWT
* Role-based authorization is implemented
* Environment variables are used for secrets
* `.env` and `node_modules` are excluded using `.gitignore`

## Internship

**Organization:** Codveda Technologies
**Program:** Full Stack Development Internship
**Level:** 3 - Advanced
**Project:** Real-Time Chat Application Backend
