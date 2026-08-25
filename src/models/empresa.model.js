const { DataTypes, Model } = require("sequelize");

const sequelize = require("../config/database");

class Empresa extends Model {}

Empresa.init(
  {
    id_empresa: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    nombre_empresa: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notEmpty: {
          msg: "El nombre de la empresa es obligatorio.",
        },
      },
    },

    razon_social: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },

    rtn: {
      type: DataTypes.STRING(20),
      allowNull: true,
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

    logo: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: "Empresa",
    tableName: "empresa",
    timestamps: false,
  }
);

module.exports = Empresa;