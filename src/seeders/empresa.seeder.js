require("dotenv").config();

const sequelize = require("../config/database");
const Empresa = require("../models/empresa.model");

async function seed() {
  try {
    await sequelize.authenticate();

    const [empresa, creada] = await Empresa.findOrCreate({
      where: {
        nombre_empresa: "Distribuidora Demo",
      },
      defaults: {
        nombre_empresa: "Distribuidora Demo",
        razon_social: "Distribuidora Demo S. de R.L.",
        rtn: null,
        direccion: "Tegucigalpa, Honduras",
        telefono: "9999-9999",
        correo: "ventas@distribuidorademo.com",
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
