require("dotenv").config();

const sequelize = require("../config/database");
const Cliente = require("../models/cliente.model");

const CLIENTES = [
  {
    nombre_cliente: "Pulpería El Centro",
    rtn: "08011999000123",
    direccion: "Tegucigalpa",
    telefono: "9876-1001",
    correo: null,
  },
  {
    nombre_cliente: "Mini Súper La Esperanza",
    rtn: null,
    direccion: "Comayagüela",
    telefono: "9876-1002",
    correo: null,
  },
  {
    nombre_cliente: "Comercial San José",
    rtn: null,
    direccion: "Tegucigalpa",
    telefono: "9876-1003",
    correo: "compras@comercialsanjose.com",
  },
];

async function seed() {
  try {
    await sequelize.authenticate();

    for (const cliente of CLIENTES) {
      const [registro, creado] = await Cliente.findOrCreate({
        where: {
          nombre_cliente: cliente.nombre_cliente,
        },
        defaults: cliente,
      });

      console.log(
        creado
          ? `✅ Cliente creado: ${registro.nombre_cliente}`
          : `↪️ Cliente ya existía: ${registro.nombre_cliente}`,
      );
    }

    console.log("🌱 Seed de clientes completado.");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error al ejecutar seed de clientes:", error);
    process.exit(1);
  }
}

seed();
