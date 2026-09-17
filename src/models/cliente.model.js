const { DataTypes, Model, Sequelize } = require("sequelize");

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

      set(valor) {
        this.setDataValue(
          "nombre_cliente",
          valor == null ? valor : String(valor).trim(),
        );
      },

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

      set(valor) {
        const texto = valor == null ? "" : String(valor).trim();

        this.setDataValue("rtn", texto === "" ? null : texto);
      },

      validate: {
        rtnValido(valor) {
          if (valor == null) {
            return;
          }

          if (!/^\d{14}$/.test(String(valor))) {
            throw new Error("El RTN debe contener exactamente 14 dígitos.");
          }
        },
      },
    },

    direccion: {
      type: DataTypes.STRING(200),
      allowNull: true,

      set(valor) {
        const texto = valor == null ? "" : String(valor).trim();

        this.setDataValue("direccion", texto === "" ? null : texto);
      },

      validate: {
        direccionValida(valor) {
          if (valor == null) {
            return;
          }

          if (String(valor).trim().length < 10) {
            throw new Error("La dirección debe tener al menos 10 caracteres.");
          }
        },
      },
    },

    telefono: {
      type: DataTypes.STRING(20),
      allowNull: true,

      set(valor) {
        const texto = valor == null ? "" : String(valor).trim();

        this.setDataValue("telefono", texto === "" ? null : texto);
      },

      validate: {
        telefonoValido(valor) {
          if (valor == null) {
            return;
          }

          if (!/^\d{8}$/.test(String(valor))) {
            throw new Error("El teléfono debe contener exactamente 8 dígitos.");
          }
        },
      },
    },

    correo: {
      type: DataTypes.STRING(100),
      allowNull: true,

      set(valor) {
        const texto = valor == null ? "" : String(valor).trim();

        this.setDataValue("correo", texto === "" ? null : texto);
      },

      validate: {
        isEmail: {
          msg: "El correo no tiene un formato válido.",
        },
      },
    },

    fecha_registro: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.NOW,
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
