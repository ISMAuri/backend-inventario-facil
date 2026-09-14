const { DataTypes, Model } = require("sequelize");
const sequelize = require("../config/database");

class Categoria extends Model {}

Categoria.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    nombre: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,

      set(valor) {
        this.setDataValue(
          "nombre",
          valor == null ? valor : String(valor).trim(),
        );
      },

      validate: {
        notEmpty: {
          msg: "El nombre de la categoría es obligatorio.",
        },

        len: {
          args: [3, 100],
          msg: "El nombre de la categoría debe tener al menos 3 caracteres.",
        },
      },
    },

    descripcion: {
      type: DataTypes.STRING(255),
      allowNull: false,

      set(valor) {
        this.setDataValue(
          "descripcion",
          valor == null ? valor : String(valor).trim(),
        );
      },

      validate: {
        notEmpty: {
          msg: "La descripción de la categoría es obligatoria.",
        },

        len: {
          args: [5, 255],
          msg: "La descripción debe tener al menos 5 caracteres.",
        },
      },
    },

    icono: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },

    activo: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  },
  {
    sequelize,
    modelName: "Categoria",
    tableName: "categorias",
    timestamps: true,
  },
);

module.exports = Categoria;
