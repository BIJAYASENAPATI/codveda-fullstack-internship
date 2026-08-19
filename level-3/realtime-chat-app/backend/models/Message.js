module.exports = (sequelize, DataTypes) => {
  const Message = sequelize.define(
    "Message",
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

      sender_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },

      type: {
        type: DataTypes.ENUM(
          "TEXT",
          "IMAGE",
          "VIDEO",
          "AUDIO",
          "DOCUMENT"
        ),
        allowNull: false,
        defaultValue: "TEXT",
      },

      content: {
        type: DataTypes.TEXT,
        allowNull: true,
      },

      status: {
        type: DataTypes.ENUM(
          "SENT",
          "DELIVERED",
          "READ"
        ),
        allowNull: false,
        defaultValue: "SENT",
      },

      reply_to_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },

      deleted_for_everyone: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },

      is_forwarded: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },

      forwarded_from_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },

      is_pinned: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },

      pinned_by: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },

      pinned_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      tableName: "messages",
      timestamps: true,

      indexes: [
        {
          fields: ["chat_id"],
        },
        {
          fields: ["sender_id"],
        },
        {
          fields: ["status"],
        },
        {
          fields: ["createdAt"],
        },
        {
          fields: ["chat_id", "createdAt"],
        },
      ],
    }
  );

  Message.associate = (models) => {
    Message.belongsTo(models.Chat, {
      foreignKey: "chat_id",
      as: "chat",
      onDelete: "CASCADE",
    });

    Message.belongsTo(models.User, {
      foreignKey: "sender_id",
      as: "sender",
      onDelete: "CASCADE",
    });

    Message.belongsTo(models.Message, {
      foreignKey: "reply_to_id",
      as: "repliedMessage",
    });

    Message.belongsTo(models.Message, {
      foreignKey: "forwarded_from_id",
      as: "forwardedMessage",
    });

    Message.belongsTo(models.User, {
      foreignKey: "pinned_by",
      as: "pinnedByUser",
    });

    Message.hasMany(models.MessageReaction, {
      foreignKey: "message_id",
      as: "reactions",
      onDelete: "CASCADE",
    });
  };

  return Message;
};