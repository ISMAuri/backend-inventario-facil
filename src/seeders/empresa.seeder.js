require("dotenv").config();

const sequelize = require("../config/database");
const Empresa = require("../models/empresa.model");

async function seed() {
  try {
    await sequelize.authenticate();

    const [empresa, creada] = await Empresa.findOrCreate({
      where: {
        nombre_empresa: "Inversiones Sammy",
      },
      defaults: {
        nombre_empresa: "Inversiones Sammy",
        razon_social: "Inversiones Sammy S. de R.L.",
        rtn: "01079016892580",
        direccion:
          "Los Fuertes contiguo al Super Olguita, Roatan, Islas de la Bahia",
        telefono: "97547973",
        correo: "inversionesammy2019@hotmail.com",
        logo: null,
      },
    });

    console.log(
      creada
        ? `✅ Empresa creada: ${empresa.nombre_empresa}`
        : `↪️ Empresa ya existía: ${empresa.nombre_empresa}`,
    );

    console.log("🌱 Seed de empresa completado.");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error al ejecutar seed de empresa:", error);
    process.exit(1);
  }
}

seed();
