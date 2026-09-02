require("dotenv").config();

const sequelize = require("../config/database");

const Venta = require("../models/venta.model");
const Cliente = require("../models/cliente.model");
const Producto = require("../models/producto.model");
const User = require("../models/user.model");
const AutorizacionFactura = require("../models/autorizacion_factura.model");

const ventaService = require("../services/venta.service");

async function seed() {
  try {
    await sequelize.authenticate();

    // ---------------------------------------------------------
    // Buscar datos necesarios para crear la venta de ejemplo
    // ---------------------------------------------------------

    const usuario = await User.findOne({
      where: { role: "admin" },
    });

    if (!usuario) {
      throw new Error(
        "No existe un usuario administrador. Ejecuta primero user.seeder.js",
      );
    }

    const cliente = await Cliente.findOne({
      where: {
        nombre_cliente: "Pulpería El Centro",
      },
    });

    if (!cliente) {
      throw new Error(
        "No existe el cliente de prueba. Ejecuta primero cliente.seeder.js",
      );
    }

    const autorizacion = await AutorizacionFactura.findOne({
      where: {
        estado: true,
      },
    });

    if (!autorizacion) {
      throw new Error(
        "No existe una autorización activa. Ejecuta primero autorizacion_factura.seeder.js",
      );
    }

    // ---------------------------------------------------------
    // Evitar crear la venta demo varias veces
    // ---------------------------------------------------------

    const numeroFacturaDemo = "001-001-01-00000001";

    const existente = await Venta.findOne({
      where: {
        numero_factura: numeroFacturaDemo,
      },
    });

    if (existente) {
      console.log(`↪️ La venta demo ${numeroFacturaDemo} ya existe`);

      process.exit(0);
    }

    // ---------------------------------------------------------
    // Buscar productos
    // ---------------------------------------------------------

    const detergente = await Producto.findOne({
      where: {
        codigo_producto: "LIM-001",
      },
    });

    const agua = await Producto.findOne({
      where: {
        codigo_producto: "BEB-001",
      },
    });

    const papel = await Producto.findOne({
      where: {
        codigo_producto: "PAP-001",
      },
    });

    if (!detergente || !agua || !papel) {
      throw new Error(
        "Faltan productos de prueba. Ejecuta primero producto.seeder.js",
      );
    }

    // ---------------------------------------------------------
    // Emitir venta
    //
    // NO creamos directamente Venta ni DetalleVenta.
    // Usamos VentaService para mantener stock, movimientos,
    // correlativo y detalles consistentes.
    // ---------------------------------------------------------

    const venta = await ventaService.emitir({
      id_cliente: cliente.id_cliente,
      id_usuario: usuario.id,
      id_autorizacion: autorizacion.id_autorizacion,

      detalles: [
        {
          id_producto: detergente.id_producto,
          cantidad: 2,
          descuento: 0,
        },
        {
          id_producto: agua.id_producto,
          cantidad: 12,
          descuento: 0,
        },
        {
          id_producto: papel.id_producto,
          cantidad: 3,
          descuento: 10,
        },
      ],

      metodo_pago: "Efectivo",

      orden_compra_exenta: null,
      constancia_registro_exonerados: null,
      registro_sag: null,

      // De momento lo ponemos manualmente porque tu service
      // actualmente espera recibir este valor.
      total_letras: "TOTAL DE VENTA DE PRUEBA",
    });

    console.log(`✅ Venta demo creada: ${venta.numero_factura}`);

    console.log(`✅ Los detalles de venta fueron creados automáticamente`);

    console.log(
      `✅ El stock y los movimientos de inventario fueron actualizados`,
    );

    console.log("🌱 Seed de venta completado.");

    process.exit(0);
  } catch (error) {
    console.error("❌ Error al ejecutar seed de venta:", error);

    process.exit(1);
  }
}

seed();
