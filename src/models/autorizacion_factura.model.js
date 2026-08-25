const { DataTypes, Model } = require("sequelize");

const sequelize = require("../config/database");

class AutorizacionFactura extends Model {}

AutorizacionFactura.init(
  {
    id_autorizacion: {
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

    cai: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },

    establecimiento: {
      type: DataTypes.STRING(3),
      allowNull: false,
    },

    punto_emision: {
      type: DataTypes.STRING(3),
      allowNull: false,
    },

    tipo_documento: {
      type: DataTypes.STRING(2),
      allowNull: false,
      defaultValue: "01",
    },

    rango_inicial: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    rango_final: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    siguiente_correlativo: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },

    fecha_autorizacion: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },

    fecha_limite_emision: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },

    estado: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  },
  {
    sequelize,
    modelName: "AutorizacionFactura",
    tableName: "autorizacion_factura",
    timestamps: false,
  }
);

module.exports = AutorizacionFactura;