module.exports = (sequelize, DataTypes) => {
  const FriendRequest = sequelize.define(
    "FriendRequest",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },

      sender_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },

      receiver_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },

      status: {
        type: DataTypes.ENUM(
          "PENDING",
          "ACCEPTED",
          "REJECTED"
        ),
        allowNull: false,
        defaultValue: "PENDING",
      },
    },
    {
      tableName: "friend_requests",
      timestamps: true,

      indexes: [
        {
          fields: ["sender_id"],
        },
        {
          fields: ["receiver_id"],
        },
        {
          fields: ["status"],
        },
        {
          unique: true,
          fields: [
            "sender_id",
            "receiver_id",
          ],
        },
      ],

      validate: {
        cannotSendToSelf() {
          if (
            this.sender_id ===
            this.receiver_id
          ) {
            throw new Error(
              "You cannot send a friend request to yourself"
            );
          }
        },
      },
    }
  );

  FriendRequest.associate = (models) => {
    FriendRequest.belongsTo(models.User, {
      foreignKey: "sender_id",
      as: "sender",
      onDelete: "CASCADE",
    });

    FriendRequest.belongsTo(models.User, {
      foreignKey: "receiver_id",
      as: "receiver",
      onDelete: "CASCADE",
    });
  };

  return FriendRequest;
};