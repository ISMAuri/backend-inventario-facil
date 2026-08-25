const { DataTypes, Model } = require("sequelize");

const sequelize = require("../config/database");

class DetalleVenta extends Model {}

DetalleVenta.init(
  {
    id_detalle_venta: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    id_venta: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "venta",
        key: "id_venta",
      },
    },

    id_producto: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "producto",
        key: "id_producto",
      },
    },

    producto_codigo_factura: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },

    producto_nombre_factura: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },

    producto_descripcion_factura: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },

    producto_unidad_medida_factura: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },

    producto_tasa_impuesto_factura: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
      defaultValue: 0.00,
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

    precio_unitario: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },

    descuento: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.00,
    },

    subtotal: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },

    base_gravada: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.00,
    },

    base_exenta: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.00,
    },

    base_exonerada: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.00,
    },

    base_tasa_cero: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.00,
    },

    monto_impuesto: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.00,
    },
  },
  {
    sequelize,
    modelName: "DetalleVenta",
    tableName: "detalle_venta",
    timestamps: false,
  }
);

module.exports = DetalleVenta;