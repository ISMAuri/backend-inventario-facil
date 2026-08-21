require('dotenv').config();
const sequelize = require('../config/database');
const Categoria = require('../models/categoria.model');

// -----------------------------------------------------------------------
// CONTEXTO PARA EL ESTUDIANTE:
// Seed idempotente del catálogo inicial de categorías de servicios.
// Usa findOrCreate para poder correrlo las veces que sea (ej. después
// de un sync({ alter: true }) en un entorno nuevo) sin duplicar
// registros ni pisar los que ya fueron editados desde el panel admin.
//
// Uso: node src/seeders/categoria.seeder.js
// -----------------------------------------------------------------------
const CATEGORIAS = [
  { nombre: 'Plomería', descripcion: 'Instalación y reparación de tuberías, grifería y sanitarios', icono: 'plumbing' },
  { nombre: 'Electricidad', descripcion: 'Instalaciones eléctricas, cableado y reparación de cortocircuitos', icono: 'electrical_services' },
  { nombre: 'Carpintería', descripcion: 'Fabricación y reparación de muebles y estructuras de madera', icono: 'carpenter' },
  { nombre: 'Pintura', descripcion: 'Pintura de interiores, exteriores y acabados decorativos', icono: 'format_paint' },
  { nombre: 'Albañilería', descripcion: 'Construcción, remodelación y reparación de mampostería', icono: 'construction' },
  { nombre: 'Aire acondicionado', descripcion: 'Instalación y mantenimiento de sistemas de climatización', icono: 'ac_unit' },
  { nombre: 'Refrigeración', descripcion: 'Reparación y mantenimiento de neveras y equipos de frío', icono: 'kitchen' },
  { nombre: 'Cerrajería', descripcion: 'Instalación y reparación de cerraduras y sistemas de seguridad', icono: 'lock' },
  { nombre: 'Jardinería', descripcion: 'Mantenimiento de jardines, poda y diseño de áreas verdes', icono: 'yard' },
  { nombre: 'Limpieza', descripcion: 'Limpieza doméstica y de espacios comerciales', icono: 'cleaning_services' },
  { nombre: 'Fumigación', descripcion: 'Control y eliminación de plagas', icono: 'pest_control' },
  { nombre: 'Instalación de electrodomésticos', descripcion: 'Instalación y conexión de electrodomésticos del hogar', icono: 'home_repair_service' },
];

async function seed() {
  try {
    await sequelize.authenticate();

    for (const categoria of CATEGORIAS) {
      const [registro, creado] = await Categoria.findOrCreate({
        where: { nombre: categoria.nombre },
        defaults: categoria,
      });
      console.log(creado ? `✅ Creada: ${registro.nombre}` : `↪️  Ya existía: ${registro.nombre}`);
    }

    console.log('🌱 Seed de categorías completado.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error al ejecutar el seed de categorías:', error);
    process.exit(1);
  }
}

seed();
