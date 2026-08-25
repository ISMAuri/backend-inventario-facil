const { DataTypes, Model } = require("sequelize");

const sequelize = require("../config/database");

class Usuario extends Model {}

Usuario.init(
  {
    id_usuario: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    id_empresa: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "empresa",
        key: "id_empresa",
      },
    },

    nombre_usuario: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notEmpty: {
          msg: "El nombre del usuario es obligatorio.",
        },
      },
    },

    correo: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notEmpty: {
          msg: "El correo es obligatorio.",
        },
        isEmail: {
          msg: "El correo no tiene un formato válido.",
        },
      },
    },

    contrasena_hash: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        notEmpty: {
          msg: "La contraseña es obligatoria.",
        },
      },
    },

    estado: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },

    fecha_registro: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    modelName: "Usuario",
    tableName: "usuario",
    timestamps: false,
  }
);

module.exports = Usuario;