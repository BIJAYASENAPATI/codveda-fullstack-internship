module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define(
    "User",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },

      name: {
        type: DataTypes.STRING(100),
        allowNull: false,
        validate: {
          notEmpty: true,
        },
      },

      email: {
        type: DataTypes.STRING(150),
        allowNull: false,
        unique: true,
        validate: {
          isEmail: true,
        },
      },

      password: {
        type: DataTypes.STRING,
        allowNull: false,
      },

      role: {
        type: DataTypes.ENUM("USER", "ADMIN"),
        allowNull: false,
        defaultValue: "USER",
      },

      profilePic: {
        type: DataTypes.STRING,
        allowNull: true,
      },

      bio: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },

      isOnline: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },

      lastSeen: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      tableName: "users",
      timestamps: true,

      indexes: [
        {
          unique: true,
          fields: ["email"],
        },
        {
          fields: ["role"],
        },
        {
          fields: ["isOnline"],
        },
      ],
    }
  );

  User.associate = (models) => {
    User.hasMany(models.Chat, {
      foreignKey: "created_by",
      as: "createdChats",
    });

    User.hasMany(models.ChatParticipant, {
      foreignKey: "user_id",
      as: "chatMemberships",
    });

    User.hasMany(models.Message, {
      foreignKey: "sender_id",
      as: "messages",
    });

    User.hasMany(models.MessageReaction, {
      foreignKey: "user_id",
      as: "reactions",
    });

    User.hasMany(models.FriendRequest, {
      foreignKey: "sender_id",
      as: "sentFriendRequests",
    });

    User.hasMany(models.FriendRequest, {
      foreignKey: "receiver_id",
      as: "receivedFriendRequests",
    });

    User.hasMany(models.BlockedUser, {
      foreignKey: "blocker_id",
      as: "blockedUsers",
    });

    User.hasMany(models.BlockedUser, {
      foreignKey: "blocked_id",
      as: "blockedByUsers",
    });
  };

  return User;
};