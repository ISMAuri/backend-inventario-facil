require("dotenv").config();

const sequelize = require("../config/database");

const Producto = require("../models/producto.model");
const User = require("../models/user.model");

const MovimientoInventario = require("../models/movimiento_inventario.model");

const movimientoInventarioService = require("../services/movimiento_inventario.service");

const STOCK_INICIAL = [
  { codigo: "LIM-001", cantidad: 40 },
  { codigo: "PAP-001", cantidad: 50 },
  { codigo: "HIG-001", cantidad: 35 },
  { codigo: "BEB-001", cantidad: 100 },
  { codigo: "PAPEL-001", cantidad: 30 },
];

async function seed() {
  try {
    await sequelize.authenticate();

    const usuario = await User.findOne({
      where: { role: "admin" },
    });

    if (!usuario) {
      throw new Error(
        "No existe usuario admin. Ejecuta primero user.seeder.js",
      );
    }

    for (const item of STOCK_INICIAL) {
      const producto = await Producto.findOne({
        where: {
          codigo_producto: item.codigo,
        },
      });

      if (!producto) {
        console.log(`⚠️ No existe el producto ${item.codigo}`);
        continue;
      }

      const existente = await MovimientoInventario.findOne({
        where: {
          id_producto: producto.id_producto,
          tipo_movimiento: "entrada",
          motivo: "Carga inicial de inventario",
        },
      });

      if (existente) {
        console.log(
          `↪️ Stock inicial ya registrado: ${producto.nombre_producto}`,
        );
        continue;
      }

      await movimientoInventarioService.crear({
        id_producto: producto.id_producto,
        id_usuario: usuario.id,
        tipo_movimiento: "entrada",
        cantidad: item.cantidad,
        motivo: "Carga inicial de inventario",
      });

      console.log(
        `✅ Stock agregado: ${producto.nombre_producto} +${item.cantidad}`,
      );
    }

    console.log("🌱 Seed de inventario completado.");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error al ejecutar seed de inventario:", error);

    process.exit(1);
  }
}

seed();
