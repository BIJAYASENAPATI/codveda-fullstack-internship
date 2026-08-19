module.exports = (sequelize, DataTypes) => {
  const ChatParticipant = sequelize.define(
    "ChatParticipant",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },

      chat_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },

      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },

      role: {
        type: DataTypes.ENUM(
          "MEMBER",
          "ADMIN"
        ),
        allowNull: false,
        defaultValue: "MEMBER",
      },

      is_muted: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },

      is_pinned: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },

      joined_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      tableName: "chat_participants",
      timestamps: false,

      indexes: [
        {
          unique: true,
          fields: ["chat_id", "user_id"],
        },
        {
          fields: ["user_id"],
        },
        {
          fields: ["chat_id"],
        },
      ],
    }
  );

  ChatParticipant.associate = (models) => {
    ChatParticipant.belongsTo(models.Chat, {
      foreignKey: "chat_id",
      as: "chat",
      onDelete: "CASCADE",
    });

    ChatParticipant.belongsTo(models.User, {
      foreignKey: "user_id",
      as: "user",
      onDelete: "CASCADE",
    });
  };

  return ChatParticipant;
};