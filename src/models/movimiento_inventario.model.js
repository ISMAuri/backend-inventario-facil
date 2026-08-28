const { DataTypes, Model } = require("sequelize");

const sequelize = require("../config/database");

class MovimientoInventario extends Model {}

MovimientoInventario.init(
  {
    id_movimiento: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    id_producto: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "producto",
        key: "id_producto",
      },
    },

    id_usuario: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
    },

    tipo_movimiento: {
      type: DataTypes.ENUM("entrada", "salida"),
      allowNull: false,
      validate: {
        isIn: {
          args: [["entrada", "salida"]],
          msg: "El tipo de movimiento debe ser entrada o salida.",
        },
      },
    },

    cantidad: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: {
          args: [1],
          msg: "La cantidad debe ser mayor que cero.",
        },
      },
    },

    fecha_movimiento: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },

    motivo: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: "MovimientoInventario",
    tableName: "movimiento_inventario",
    timestamps: false,
  }
);

module.exports = MovimientoInventario;