const { DataTypes, Model } = require("sequelize");

const sequelize = require("../config/database");

class Venta extends Model {}

Venta.init(
  {
    id_venta: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    id_cliente: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "cliente",
        key: "id_cliente",
      },
    },

    id_usuario: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "usuario",
        key: "id_usuario",
      },
    },

    id_autorizacion: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "autorizacion_factura",
        key: "id_autorizacion",
      },
    },

    numero_factura: {
      type: DataTypes.STRING(19),
      allowNull: false,
    },

    correlativo: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    cai_factura: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },

    rango_inicial_factura: {
      type: DataTypes.STRING(19),
      allowNull: false,
    },

    rango_final_factura: {
      type: DataTypes.STRING(19),
      allowNull: false,
    },

    fecha_limite_emision_factura: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },

    empresa_nombre_factura: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },

    empresa_razon_social_factura: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },

    empresa_rtn_factura: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },

    empresa_direccion_factura: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },

    empresa_telefono_factura: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },

    empresa_correo_factura: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },

    empresa_logo_factura: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },

    cliente_nombre_factura: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },

    cliente_tipo_documento_factura: {
      type: DataTypes.STRING(30),
      allowNull: true,
    },

    cliente_numero_documento_factura: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },

    cliente_rtn_factura: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },

    cliente_direccion_factura: {
      type: DataTypes.STRING(200),
      allowNull: true,
    },

    cliente_telefono_factura: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },

    cliente_correo_factura: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },

    orden_compra_exenta: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },

    constancia_registro_exonerados: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },

    registro_sag: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },

    fecha_venta: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },

    moneda: {
      type: DataTypes.STRING(3),
      allowNull: false,
      defaultValue: "HNL",
    },

    tasa_cambio: {
      type: DataTypes.DECIMAL(12, 6),
      allowNull: false,
      defaultValue: 1.000000,
    },

    subtotal: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },

    total_descuentos: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.00,
    },

    total_exento: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.00,
    },

    total_exonerado: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.00,
    },

    total_tasa_cero: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.00,
    },

    total_gravado_15: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.00,
    },

    total_gravado_18: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.00,
    },

    total_isv_15: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.00,
    },

    total_isv_18: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.00,
    },

    total: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },

    total_letras: {
      type: DataTypes.STRING(500),
      allowNull: false,
    },

    estado_pago: {
      type: DataTypes.STRING(30),
      allowNull: true,
    },

    metodo_pago: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },

    ruta_pdf_factura: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: "Venta",
    tableName: "venta",
    timestamps: false,
  }
);

module.exports = Venta;