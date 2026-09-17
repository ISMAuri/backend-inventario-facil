const { DataTypes, Model } = require("sequelize");
const sequelize = require("../config/database");

class PasswordResetOtp extends Model {}

PasswordResetOtp.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
    },

    recoveryHash: {
      type: DataTypes.STRING(64),
      allowNull: false,
    },

    otpHash: {
      type: DataTypes.STRING(64),
      allowNull: false,
    },

    expiresAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },

    verifiedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },

    usedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },

    attempts: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
  },
  {
    sequelize,
    modelName: "PasswordResetOtp",
    tableName: "password_reset_otps",
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ["recoveryHash"],
      },
      {
        fields: ["userId"],
      },
    ],
  },
);

module.exports = PasswordResetOtp;
