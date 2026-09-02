require("dotenv").config();

const sequelize = require("../config/database");

const Producto = require("../models/producto.model");
const Categoria = require("../models/categoria.model");

const PRODUCTOS = [
  {
    categoria: "Limpieza",
    nombre_producto: "Detergente en polvo 1 kg",
    descripcion: "Detergente para lavado de ropa",
    codigo_producto: "LIM-001",
    precio_compra: 70.0,
    precio_venta: 95.0,
    unidad_medida: "unidad",
    tasa_impuesto: 15.0,
  },
  {
    categoria: "Papel y desechables",
    nombre_producto: "Papel higiénico 4 rollos",
    descripcion: "Paquete de cuatro rollos",
    codigo_producto: "PAP-001",
    precio_compra: 50.0,
    precio_venta: 70.0,
    unidad_medida: "paquete",
    tasa_impuesto: 15.0,
  },
  {
    categoria: "Higiene personal",
    nombre_producto: "Jabón líquido 500 ml",
    descripcion: "Jabón líquido para manos",
    codigo_producto: "HIG-001",
    precio_compra: 45.0,
    precio_venta: 65.0,
    unidad_medida: "unidad",
    tasa_impuesto: 15.0,
  },
  {
    categoria: "Bebidas",
    nombre_producto: "Agua purificada 600 ml",
    descripcion: "Botella de agua purificada",
    codigo_producto: "BEB-001",
    precio_compra: 10.0,
    precio_venta: 15.0,
    unidad_medida: "unidad",
    tasa_impuesto: 15.0,
  },
  {
    categoria: "Papelería",
    nombre_producto: "Cuaderno universitario",
    descripcion: "Cuaderno rayado de uso general",
    codigo_producto: "PAPEL-001",
    precio_compra: 30.0,
    precio_venta: 45.0,
    unidad_medida: "unidad",
    tasa_impuesto: 15.0,
  },
];

async function seed() {
  try {
    await sequelize.authenticate();

    for (const producto of PRODUCTOS) {
      const categoria = await Categoria.findOne({
        where: {
          nombre: producto.categoria,
        },
      });

      if (!categoria) {
        console.log(`⚠️ No existe la categoría: ${producto.categoria}`);
        continue;
      }

      const [registro, creado] = await Producto.findOrCreate({
        where: {
          codigo_producto: producto.codigo_producto,
        },
        defaults: {
          id_categoria: categoria.id,
          nombre_producto: producto.nombre_producto,
          descripcion: producto.descripcion,
          codigo_producto: producto.codigo_producto,
          precio_compra: producto.precio_compra,
          precio_venta: producto.precio_venta,
          stock_actual: 0,
          unidad_medida: producto.unidad_medida,
          tasa_impuesto: producto.tasa_impuesto,
          estado: true,
        },
      });

      console.log(
        creado
          ? `✅ Producto creado: ${registro.nombre_producto}`
          : `↪️ Producto ya existía: ${registro.nombre_producto}`,
      );
    }

    console.log("🌱 Seed de productos completado.");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error al ejecutar seed de productos:", error);
    process.exit(1);
  }
}

seed();
