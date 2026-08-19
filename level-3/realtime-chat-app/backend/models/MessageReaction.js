module.exports = (sequelize, DataTypes) => {
  const MessageReaction =
    sequelize.define(
      "MessageReaction",
      {
        id: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true,
        },

        message_id: {
          type: DataTypes.INTEGER,
          allowNull: false,
        },

        user_id: {
          type: DataTypes.INTEGER,
          allowNull: false,
        },

        emoji: {
          type: DataTypes.STRING(20),
          allowNull: false,
          validate: {
            notEmpty: true,
          },
        },
      },
      {
        tableName: "message_reactions",
        timestamps: true,

        indexes: [
          {
            unique: true,
            fields: [
              "message_id",
              "user_id",
            ],
          },

          {
            fields: ["message_id"],
          },

          {
            fields: ["user_id"],
          },
        ],
      }
    );

  MessageReaction.associate = (models) => {
    MessageReaction.belongsTo(
      models.Message,
      {
        foreignKey: "message_id",
        as: "message",
        onDelete: "CASCADE",
      }
    );

    MessageReaction.belongsTo(
      models.User,
      {
        foreignKey: "user_id",
        as: "user",
        onDelete: "CASCADE",
      }
    );
  };

  return MessageReaction;
};