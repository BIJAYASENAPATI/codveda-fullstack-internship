module.exports = (sequelize, DataTypes) => {
  const Chat = sequelize.define(
    "Chat",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },

      name: {
        type: DataTypes.STRING(150),
        allowNull: true,
      },

      chat_type: {
        type: DataTypes.ENUM("DIRECT", "GROUP"),
        allowNull: false,
        defaultValue: "DIRECT",
      },

      created_by: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    },
    {
      tableName: "chats",
      timestamps: true,

      indexes: [
        {
          fields: ["chat_type"],
        },
        {
          fields: ["created_by"],
        },
        {
          fields: ["createdAt"],
        },
      ],
    }
  );

  Chat.associate = (models) => {
    Chat.belongsTo(models.User, {
      foreignKey: "created_by",
      as: "creator",
      onDelete: "CASCADE",
    });

    Chat.hasMany(models.ChatParticipant, {
      foreignKey: "chat_id",
      as: "participants",
      onDelete: "CASCADE",
    });

    Chat.hasMany(models.Message, {
      foreignKey: "chat_id",
      as: "messages",
      onDelete: "CASCADE",
    });
  };

  return Chat;
};