require("dotenv").config();

const bcrypt = require("bcrypt");

const sequelize = require("../config/database");
const User = require("../models/user.model");

async function seed() {
  try {
    await sequelize.authenticate();

    const email = "admin@inventario.com";

    const existente = await User.findOne({
      where: { email },
    });

    if (existente) {
      console.log("↪️ El usuario administrador ya existe.");
      process.exit(0);
    }

    const password = process.env.SEED_ADMIN_PASSWORD;

    if (!password) {
      throw new Error("SEED_ADMIN_PASSWORD no está configurada");
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const usuario = await User.create({
      fullName: "Administrador",
      email,
      passwordHash,
      role: "admin",
      isEmailVerified: true,
    });

    console.log(`✅ Usuario creado: ${usuario.email}`);
    console.log("🌱 Seed de usuario completado.");

    process.exit(0);
  } catch (error) {
    console.error("❌ Error al ejecutar seed de usuario:", error);
    process.exit(1);
  }
}

seed();
