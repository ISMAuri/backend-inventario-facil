const { DataTypes, Model } = require("sequelize");
const sequelize = require("../config/database");

class User extends Model {}

User.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    fullName: {
      type: DataTypes.STRING(150),
      allowNull: false,
    },

    email: {
      type: DataTypes.STRING(150),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },

    // Nunca se guarda la contraseña en texto plano.
    passwordHash: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    role: {
      type: DataTypes.ENUM("client", "user", "provider", "admin"),
      allowNull: false,
      defaultValue: "user",
    },

    isEmailVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    sequelize,
    modelName: "User",
    tableName: "users",
    timestamps: true,
  },
);

module.exports = User;
