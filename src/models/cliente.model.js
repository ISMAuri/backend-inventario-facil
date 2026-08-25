const { DataTypes, Model } = require("sequelize");

const sequelize = require("../config/database");

class Cliente extends Model {}

Cliente.init(
  {
    id_cliente: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    nombre_cliente: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notEmpty: {
          msg: "El nombre del cliente es obligatorio.",
        },
      },
    },

    rtn: {
      type: DataTypes.STRING(14),
      allowNull: true,
      unique: true,
    },

    direccion: {
      type: DataTypes.STRING(200),
      allowNull: true,
    },

    telefono: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },

    correo: {
      type: DataTypes.STRING(100),
      allowNull: true,
      validate: {
        isEmail: {
          msg: "El correo no tiene un formato válido.",
        },
      },
    },

    fecha_registro: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },

    estado: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  },
  {
    sequelize,
    modelName: "Cliente",
    tableName: "cliente",
    timestamps: false,
  },
);

module.exports = Cliente;
