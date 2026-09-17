require("dotenv").config();

const sequelize = require("../config/database");

const Empresa = require("../models/empresa.model");

const AutorizacionFactura = require("../models/autorizacion_factura.model");

async function seed() {
  try {
    await sequelize.authenticate();

    const empresa = await Empresa.findOne();

    if (!empresa) {
      throw new Error(
        "No existe una empresa. Ejecuta primero empresa.seeder.js",
      );
    }

    const [autorizacion, creada] = await AutorizacionFactura.findOrCreate({
      where: {
        cai: "3C18C3-8C69E3-1BE5E0-63BE03-0909BF-A0",
      },
      defaults: {
        id_empresa: empresa.id_empresa,
        cai: "3C18C3-8C69E3-1BE5E0-63BE03-0909BF-A0",
        establecimiento: "001",
        punto_emision: "001",
        tipo_documento: "01",
        rango_inicial: 1,
        rango_final: 5000,
        siguiente_correlativo: 1,
        fecha_autorizacion: "2026-01-01",
        fecha_limite_emision: "2027-12-31",
        estado: true,
      },
    });

    console.log(
      creada
        ? `✅ Autorización creada: ${autorizacion.cai}`
        : `↪️ Autorización ya existía: ${autorizacion.cai}`,
    );

    console.log("🌱 Seed de autorización completado.");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error al ejecutar seed de autorización:", error);
    process.exit(1);
  }
}

seed();
