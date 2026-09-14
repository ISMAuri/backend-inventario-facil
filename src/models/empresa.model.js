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

      set(valor) {
        this.setDataValue(
          "nombre_empresa",
          valor == null ? valor : String(valor).trim(),
        );
      },

      validate: {
        notEmpty: {
          msg: "El nombre de la empresa es obligatorio.",
        },

        len: {
          args: [2, 100],
          msg: "El nombre de la empresa debe tener al menos 2 caracteres.",
        },
      },
    },

    razon_social: {
      type: DataTypes.STRING(100),
      allowNull: false,

      set(valor) {
        this.setDataValue(
          "razon_social",
          valor == null ? valor : String(valor).trim(),
        );
      },

      validate: {
        notEmpty: {
          msg: "La razón social es obligatoria.",
        },

        len: {
          args: [2, 100],
          msg: "La razón social debe tener al menos 2 caracteres.",
        },
      },
    },

    rtn: {
      type: DataTypes.STRING(20),
      allowNull: false,

      set(valor) {
        this.setDataValue("rtn", valor == null ? valor : String(valor).trim());
      },

      validate: {
        notEmpty: {
          msg: "El RTN de la empresa es obligatorio.",
        },

        rtnValido(valor) {
          if (!/^\d{14}$/.test(String(valor ?? ""))) {
            throw new Error("El RTN debe contener exactamente 14 dígitos.");
          }
        },
      },
    },

    direccion: {
      type: DataTypes.STRING(200),
      allowNull: false,

      set(valor) {
        this.setDataValue(
          "direccion",
          valor == null ? valor : String(valor).trim(),
        );
      },

      validate: {
        notEmpty: {
          msg: "La dirección de la empresa es obligatoria.",
        },

        len: {
          args: [10, 200],
          msg: "La dirección debe tener al menos 10 caracteres.",
        },
      },
    },

    telefono: {
      type: DataTypes.STRING(20),
      allowNull: false,

      set(valor) {
        this.setDataValue(
          "telefono",
          valor == null ? valor : String(valor).trim(),
        );
      },

      validate: {
        notEmpty: {
          msg: "El teléfono de la empresa es obligatorio.",
        },

        telefonoValido(valor) {
          if (!/^\d{8}$/.test(String(valor ?? ""))) {
            throw new Error("El teléfono debe contener exactamente 8 dígitos.");
          }
        },
      },
    },

    correo: {
      type: DataTypes.STRING(100),
      allowNull: false,

      set(valor) {
        this.setDataValue(
          "correo",
          valor == null ? valor : String(valor).trim(),
        );
      },

      validate: {
        notEmpty: {
          msg: "El correo de la empresa es obligatorio.",
        },

        isEmail: {
          msg: "El correo no tiene un formato válido.",
        },
      },
    },

    logo: {
      type: DataTypes.STRING(255),
      allowNull: true,

      set(valor) {
        const texto = valor == null ? "" : String(valor).trim();

        this.setDataValue("logo", texto === "" ? null : texto);
      },
    },
  },
  {
    sequelize,
    modelName: "Empresa",
    tableName: "empresa",
    timestamps: false,
  },
);

module.exports = Empresa;
