const { DataTypes, Model } = require("sequelize");

const sequelize = require("../config/database");

class Producto extends Model {}

Producto.init(
  {
    id_producto: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    id_categoria: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "categoria",
        key: "id_categoria",
      },
    },

    nombre_producto: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notEmpty: {
          msg: "El nombre del producto es obligatorio.",
        },
      },
    },

    descripcion: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },

    codigo_producto: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },

    precio_compra: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },

    precio_venta: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        notNull: {
          msg: "El precio de venta es obligatorio.",
        },
        min: {
          args: [0],
          msg: "El precio de venta no puede ser negativo.",
        },
      },
    },

    stock_actual: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: {
          args: [0],
          msg: "El stock no puede ser negativo.",
        },
      },
    },

    unidad_medida: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },

    tasa_impuesto: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
      defaultValue: 15.0,
      validate: {
        min: {
          args: [0],
          msg: "La tasa de impuesto no puede ser negativa.",
        },
      },
    },

    estado: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  },
  {
    sequelize,
    modelName: "Producto",
    tableName: "producto",
    timestamps: false,
  },
);

module.exports = Producto;
