const { execFileSync } = require("child_process");
const path = require("path");

// -----------------------------------------------------------------------
// Ejecuta todos los seeders en el orden necesario para respetar
// las relaciones entre las tablas.
//
// - Producto necesita que Categoria exista.
// - AutorizacionFactura necesita que Empresa exista.
// - MovimientoInventario necesita Producto y User.
// - Venta necesita prácticamente todos los datos anteriores.
// -----------------------------------------------------------------------

const SEEDERS = [
  "categoria.seeder.js",
  "empresa.seeder.js",
  "user.seeder.js",
  "cliente.seeder.js",
  "producto.seeder.js",
  "autorizacion_factura.seeder.js",
  "movimiento_inventario.seeder.js",
  "venta.seeder.js",
];

function ejecutarSeeders() {
  console.log("\n🌱 Iniciando seed completo...\n");

  for (const seeder of SEEDERS) {
    const rutaSeeder = path.join(__dirname, seeder);

    console.log(`\n▶ Ejecutando ${seeder}...\n`);

    try {
      execFileSync(process.execPath, [rutaSeeder], {
        stdio: "inherit",
      });
    } catch (error) {
      console.error(`\n❌ Falló ${seeder}. Se detuvo el proceso de seed.`);

      process.exit(1);
    }
  }

  console.log("\n✅ Todos los seeders fueron ejecutados correctamente.");
}

ejecutarSeeders();
