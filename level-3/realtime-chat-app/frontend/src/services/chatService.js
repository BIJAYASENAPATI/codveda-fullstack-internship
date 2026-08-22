import api from "./api";

// ========================================
// GET MY CHATS
// GET /api/chats
// ========================================

export const getChats =
  async () => {
    try {
      const response =
        await api.get(
          "/api/chats"
        );

      return (
        response.data.data || []
      );
    } catch (error) {
      throw new Error(
        error.response?.data
          ?.message ||
          "Unable to load chats"
      );
    }
  };


// ========================================
// GET CHAT BY ID
// GET /api/chats/:id
// ========================================

export const getChatById =
  async (chatId) => {
    try {
      const response =
        await api.get(
          `/api/chats/${chatId}`
        );

      return response.data.data;
    } catch (error) {
      throw new Error(
        error.response?.data
          ?.message ||
          "Unable to load chat"
      );
    }
  };


// ========================================
// CREATE CHAT
// POST /api/chats
// ========================================

export const createChat =
  async ({
    chat_type = "DIRECT",
    name = null,
    participant_ids = [],
  }) => {
    try {
      const response =
        await api.post(
          "/api/chats",
          {
            chat_type,
            name,
            participant_ids,
          }
        );

      return response.data.data;
    } catch (error) {
      throw new Error(
        error.response?.data
          ?.message ||
          "Unable to create chat"
      );
    }
  };


// ========================================
// DELETE CHAT
// DELETE /api/chats/:id
// ========================================

export const deleteChat =
  async (chatId) => {
    try {
      const response =
        await api.delete(
          `/api/chats/${chatId}`
        );

      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data
          ?.message ||
          "Unable to delete chat"
      );
    }
  };