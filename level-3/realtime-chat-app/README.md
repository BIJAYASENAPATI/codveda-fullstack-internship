# 💬 Baat Cheet – Premium Real-Time Chat Application

**Baat Cheet** is a premium, real-time full-stack chat application built as part of the Codveda Technologies Full-Stack Internship (Level 3). It utilizes Node.js, Express, MySQL (Sequelize), React, Vite, and WebSockets (Socket.IO) to deliver a modern, interactive messaging experience.

---

## 🌟 Application Features

### 📨 Advanced Messaging & Interaction
- **Real-Time Messages:** Instant messaging using Socket.IO.
- **Message Editing:** Edit sent messages inline within a 15-minute window.
- **Unified Delete Options:** Choose to **Delete for me** (local hide) or **Delete for everyone** (soft delete across the database).
- **Message Pinning:** Pin important messages to a sticky glassmorphic banner at the top of the chat area.
- **Message Forwarding:** Easily forward copy of messages to one or multiple chat threads.
- **Detailed Message Info:** Modal popup detailing precise Sent, Delivered, and Read timestamps.

### 👤 Profile Management
- **Own Profile view:** Access your profile card in the sidebar. Allows updating Name, About/Bio, and Email.
- **Other User Profile:** Securely click participant headers to view Name and About/Bio. *Emails and Roles are strictly hidden for privacy.*

### ⚡ Performance & State Integrity
- **Robust Presence Sync:** Fallback validation prioritizing live socket connections while utilizing DB status values (online/last seen) to eliminate "offline flashes" on reload.
- **Session Persistence:** Remembers active selections and locally-deleted message IDs across page reloads.
- **Symmetric options menu layouts:** Options dropdown menu triggers align consistently to the top-right of both sent and received bubbles.

---

## 🛠️ Project Structure

```text
realtime-chat-app/
├── backend/            # Express, Node.js, Sequelize ORM & Socket.IO
│   ├── controllers/    # API Request handlers (auth, user, chat, messages)
│   ├── db/             # Sequelize database connector & configuration
│   ├── models/         # Sequelize database schemas (User, Message, Chat)
│   ├── routes/         # Express API routes
│   └── socket/         # Socket.IO connection event triggers
│
├── frontend/           # React, Vite, & custom CSS (Baat Cheet Dark Theme)
│   ├── src/
│   │   ├── components/ # Reusable UI pieces (Modals, Bubble list, Sidebar)
│   │   ├── context/    # Global states (AuthContext, SocketContext)
│   │   └── pages/      # Root layout pages (Login, Signup, Chat)
│   └── index.html
│
└── README.md           # Project Root Guide (this file)
```

---

## 🚀 Getting Started

### 📋 Prerequisites
- **Node.js** (v16.x or higher)
- **npm** (v7.x or higher)
- **MySQL Server** (running locally or remotely)

---

### 1️⃣ Database Setup
Create a new MySQL database called `codveda_level3_chat`:
```sql
CREATE DATABASE codveda_level3_chat;
```

---

### 2️⃣ Backend Configuration & Startup
1. Navigate to the backend folder:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables:
   Create a `.env` file from the template `.env.example`:
   ```env
   PORT=6001
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_mysql_password
   DB_NAME=codveda_level3_chat
   DB_DIALECT=mysql
   JWT_SECRET=your_jwt_secret_key
   ```
4. Start the backend server:
   ```bash
   npm run dev
   ```
   The backend server runs at `http://localhost:6001`.

---

### 3️⃣ Frontend Configuration & Startup
1. Open a new terminal and navigate to the frontend folder:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure the environment variables:
   Create a `.env` file containing the backend endpoint:
   ```env
   VITE_API_URL=http://localhost:6001
   ```
4. Start the frontend developer server:
   ```bash
   npm run dev
   ```
   The React Vite application boots at `http://localhost:5173`.

---

## 🧪 Testing Multi-User Interactions
Because web browsers share `localStorage` context across active tabs on the same port (`localhost:5173`), logging in on one tab will automatically share the session with any normal second tab. 

**To test interactions between User A and User B locally:**
1. Open your main browser tab (e.g. Chrome) and log in/register as **User A**.
2. Open an **Incognito / Private Window** (or a separate browser like Microsoft Edge, Firefox, or Safari) and log in/register as **User B**.
3. Create a chat, verify real-time status updates (Online/Last seen timestamp transitions), typing indicators, message actions (Edit, Pin, Forward, Delete), and profile views.
