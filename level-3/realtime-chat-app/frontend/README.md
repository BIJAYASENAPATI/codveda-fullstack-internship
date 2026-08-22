# 💬 Baat Cheet Chat Application - Frontend

This is the frontend component of **Baat Cheet**, a premium real-time full-stack chat application. It is built using React, Vite, and WebSocket connections (Socket.IO-client) with glassmorphism styling and rich micro-animations.

## 🚀 Features

- **Real-Time Messaging:** Instant message sending and status synchronization (Sent, Delivered, Read badges).
- **Advanced Bubble Actions:**
  - **Message Editing:** Edit sent messages within 15 minutes of creation.
  - **Single Delete with Options Dialog:** Modal confirmation offering "Delete for me" (local storage override) or "Delete for everyone" (soft delete in backend).
  - **Message Pinning:** Stick message banners to the top of the chat area.
  - **Message Forwarding:** Copy messages to single or multiple target chats.
  - **Message Info:** Detailed modal displaying the message's Sent, Delivered, and Read timestamps.
- **Smart Context Dropdowns:** Dropdown alignment that context-aware scales upwards if triggered near the bottom border of the page (last few messages).
- **User Presence Fallback:** Instant status validation falling back to database entries (online/last seen) during page refresh before socket events load.
- **Profile Views:**
  - **Own Profile Card:** Modify Name, Bio (About), and Email/Username in an inline edit mode.
  - **Other User Profile:** Securely view other contact details (Name and Bio only; email and role hidden).
- **State Persistence:** Preserves active chats and local message overrides across tab reloads.

## 🛠️ Setup & Running

1. **Install Dependencies:**
   ```bash
   cd frontend
   npm install
   ```
2. **Environment Configuration:**
   Configure a `.env` file using `.env.example`:
   ```env
   VITE_API_URL=http://localhost:6001
   ```
3. **Run Dev Server:**
   ```bash
   npm run dev
   ```
   The client will boot at `http://localhost:5173`.
