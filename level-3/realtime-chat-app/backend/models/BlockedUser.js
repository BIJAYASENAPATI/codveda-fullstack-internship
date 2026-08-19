module.exports = (sequelize, DataTypes) => {
  const BlockedUser = sequelize.define(
    "BlockedUser",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },

      blocker_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },

      blocked_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    },
    {
      tableName: "blocked_users",

      timestamps: true,

      createdAt: "created_at",
      updatedAt: false,

      indexes: [
        {
          unique: true,
          fields: [
            "blocker_id",
            "blocked_id",
          ],
        },

        {
          fields: ["blocker_id"],
        },

        {
          fields: ["blocked_id"],
        },
      ],

      validate: {
        cannotBlockSelf() {
          if (
            this.blocker_id ===
            this.blocked_id
          ) {
            throw new Error(
              "You cannot block yourself"
            );
          }
        },
      },
    }
  );

  BlockedUser.associate = (models) => {
    BlockedUser.belongsTo(models.User, {
      foreignKey: "blocker_id",
      as: "blocker",
      onDelete: "CASCADE",
    });

    BlockedUser.belongsTo(models.User, {
      foreignKey: "blocked_id",
      as: "blockedUser",
      onDelete: "CASCADE",
    });
  };

  return BlockedUser;
};