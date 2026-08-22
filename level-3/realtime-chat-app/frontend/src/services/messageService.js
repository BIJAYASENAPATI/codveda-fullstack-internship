import api from "./api";

// ========================================
// GET CHAT MESSAGES
// GET /api/messages?chat_id=1
// ========================================

export const getMessages =
  async (
    chatId,
    {
      limit = 50,
      offset = 0,
    } = {}
  ) => {
    try {
      const response =
        await api.get(
          "/api/messages",
          {
            params: {
              chat_id: chatId,
              limit,
              offset,
            },
          }
        );

      return (
        response.data.data || []
      );
    } catch (error) {
      throw new Error(
        error.response?.data
          ?.message ||
          "Unable to load messages"
      );
    }
  };


// ========================================
// GET MESSAGE BY ID
// GET /api/messages/:id
// ========================================

export const getMessageById =
  async (messageId) => {
    try {
      const response =
        await api.get(
          `/api/messages/${messageId}`
        );

      return response.data.data;
    } catch (error) {
      throw new Error(
        error.response?.data
          ?.message ||
          "Unable to load message"
      );
    }
  };


// ========================================
// SEND MESSAGE USING REST
// POST /api/messages
//
// Socket.IO will normally be used in the
// actual chat UI, but this REST method is
// useful as a fallback/test.
// ========================================

export const sendMessage =
  async ({
    chat_id,
    content,
    type = "TEXT",
  }) => {
    try {
      const response =
        await api.post(
          "/api/messages",
          {
            chat_id,
            content,
            type,
          }
        );

      return response.data.data;
    } catch (error) {
      throw new Error(
        error.response?.data
          ?.message ||
          "Unable to send message"
      );
    }
  };


// ========================================
// UPDATE MESSAGE
// PUT /api/messages/:id
// ========================================

export const updateMessage =
  async (
    messageId,
    content
  ) => {
    try {
      const response =
        await api.put(
          `/api/messages/${messageId}`,
          {
            content,
          }
        );

      return response.data.data;
    } catch (error) {
      throw new Error(
        error.response?.data
          ?.message ||
          "Unable to update message"
      );
    }
  };


// ========================================
// DELETE MESSAGE
// DELETE /api/messages/:id
// ========================================

export const deleteMessage =
  async (messageId) => {
    try {
      const response =
        await api.delete(
          `/api/messages/${messageId}`
        );

      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data
          ?.message ||
          "Unable to delete message"
      );
    }
  };