import AdminJS, { ComponentLoader, DefaultAuthProvider } from "adminjs";

import AdminJSExpress from "@adminjs/express";
import * as AdminJSSequelize from "@adminjs/sequelize";

import bcrypt from "bcrypt";
import session from "express-session";
import connectSessionSequelize from "connect-session-sequelize";

import sequelize from "../config/database.js";

import User from "../models/user.model.js";
import Categoria from "../models/categoria.model.js";
import Producto from "../models/producto.model.js";
import Cliente from "../models/cliente.model.js";
import Empresa from "../models/empresa.model.js";
import AutorizacionFactura from "../models/autorizacion_factura.model.js";
import Venta from "../models/venta.model.js";
import DetalleVenta from "../models/detalle_venta.model.js";
import MovimientoInventario from "../models/movimiento_inventario.model.js";
import { Op } from "sequelize";
import path from "path";
import { fileURLToPath } from "url";

// Adaptador Sequelize
AdminJS.registerAdapter({
  Resource: AdminJSSequelize.Resource,
  Database: AdminJSSequelize.Database,
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const componentLoader = new ComponentLoader();

const Dashboard = componentLoader.add(
  "DashboardInventario",
  path.resolve(__dirname, "components", "dashboard.jsx"),
);

// Grupos del menú
const navegacionInventario = {
  name: "Inventario",
  icon: "Package",
};

const navegacionVentas = {
  name: "Ventas",
  icon: "ShoppingCart",
};

const navegacionConfiguracion = {
  name: "Configuración",
  icon: "Settings",
};

const navegacionSeguridad = {
  name: "Seguridad",
  icon: "User",
};

// Bloquea modificaciones
const accionesSoloLectura = {
  new: {
    isAccessible: false,
    isVisible: false,
  },

  edit: {
    isAccessible: false,
    isVisible: false,
  },

  delete: {
    isAccessible: false,
    isVisible: false,
  },

  bulkDelete: {
    isAccessible: false,
    isVisible: false,
  },
};

// Evita eliminación física
const accionesSinEliminar = {
  delete: {
    isAccessible: false,
    isVisible: false,
  },

  bulkDelete: {
    isAccessible: false,
    isVisible: false,
  },
};

// Quita passwordHash de las respuestas
const ocultarPassword = async (response) => {
  if (response.record?.params) {
    delete response.record.params.passwordHash;
  }

  if (response.records) {
    response.records.forEach((record) => {
      if (record.params) {
        delete record.params.passwordHash;
      }
    });
  }

  return response;
};

// Login del administrador
const autenticarAdministrador = async ({ email, password }) => {
  try {
    if (!email || !password) {
      return null;
    }

    const correo = String(email).trim().toLowerCase();

    const usuario = await User.findOne({
      where: {
        email: correo,
      },
    });

    if (!usuario) {
      return null;
    }

    if (usuario.role !== "admin") {
      return null;
    }

    const passwordCorrecta = await bcrypt.compare(
      password,
      usuario.passwordHash,
    );

    if (!passwordCorrecta) {
      return null;
    }

    return {
      id: usuario.id,
      email: usuario.email,
      title: usuario.fullName,
      role: usuario.role,
    };
  } catch (error) {
    console.error("❌ Error al autenticar administrador:", error);

    return null;
  }
};

const dashboardHandler = async () => {
  const [
    totalProductos,
    totalClientes,
    totalVentas,
    stockBajo,
    agotados,
    ventasAnuladas,
    totalFacturado,
  ] = await Promise.all([
    Producto.count(),

    Cliente.count(),

    Venta.count(),

    Producto.count({
      where: {
        stock_actual: {
          [Op.gt]: 0,
          [Op.lte]: 10,
        },
      },
    }),

    Producto.count({
      where: {
        stock_actual: 0,
      },
    }),

    Venta.count({
      where: {
        estado_factura: false,
      },
    }),

    Venta.sum("total", {
      where: {
        estado_factura: true,
      },
    }),
  ]);

  return {
    totalProductos,
    totalClientes,
    totalVentas,
    stockBajo,
    agotados,
    ventasAnuladas,
    totalFacturado: totalFacturado ?? 0,
  };
};

export async function crearAdminRouter() {
  const sessionSecret = process.env.ADMIN_SESSION_SECRET;

  if (!sessionSecret) {
    throw new Error("ADMIN_SESSION_SECRET no está configurada.");
  }

  const admin = new AdminJS({
    rootPath: "/admin",

    componentLoader,
    dashboard: {
      component: Dashboard,
      handler: dashboardHandler,
    },

    resources: [
      // Categorías
      {
        resource: Categoria,

        options: {
          navigation: navegacionInventario,

          actions: {
            ...accionesSinEliminar,
          },
        },
      },

      // Productos
      {
        resource: Producto,

        options: {
          navigation: navegacionInventario,

          actions: {
            ...accionesSinEliminar,
          },

          properties: {
            // El stock debe cambiar mediante movimientos
            stock_actual: {
              isVisible: {
                list: true,
                filter: true,
                show: true,
                edit: false,
              },
            },
          },
        },
      },

      // Movimientos de inventario
      {
        resource: MovimientoInventario,

        options: {
          navigation: navegacionInventario,

          actions: {
            ...accionesSoloLectura,
          },
        },
      },

      // Clientes
      {
        resource: Cliente,

        options: {
          navigation: navegacionVentas,

          actions: {
            ...accionesSinEliminar,
          },
        },
      },

      // Ventas
      {
        resource: Venta,

        options: {
          navigation: navegacionVentas,

          actions: {
            ...accionesSoloLectura,
          },
        },
      },

      // Detalles de venta
      {
        resource: DetalleVenta,

        options: {
          navigation: navegacionVentas,

          actions: {
            ...accionesSoloLectura,
          },
        },
      },

      // Empresa
      {
        resource: Empresa,

        options: {
          navigation: navegacionConfiguracion,

          actions: {
            new: {
              isAccessible: false,
              isVisible: false,
            },

            delete: {
              isAccessible: false,
              isVisible: false,
            },

            bulkDelete: {
              isAccessible: false,
              isVisible: false,
            },
          },
        },
      },

      // Autorizaciones fiscales
      {
        resource: AutorizacionFactura,

        options: {
          navigation: navegacionConfiguracion,

          actions: {
            ...accionesSoloLectura,
          },
        },
      },

      // Usuarios
      {
        resource: User,

        options: {
          navigation: navegacionSeguridad,

          properties: {
            passwordHash: {
              isVisible: false,
            },
          },

          actions: {
            new: {
              isAccessible: false,
              isVisible: false,
            },

            edit: {
              isAccessible: false,
              isVisible: false,
            },

            delete: {
              isAccessible: false,
              isVisible: false,
            },

            bulkDelete: {
              isAccessible: false,
              isVisible: false,
            },

            list: {
              after: ocultarPassword,
            },

            show: {
              after: ocultarPassword,
            },

            search: {
              after: ocultarPassword,
            },
          },
        },
      },
    ],

    branding: {
      companyName: "Inventario Fácil",
      withMadeWithLove: false,
    },
  });
  // Recompila los componentes personalizados cuando cambian
  if (process.env.NODE_ENV === "development") {
    admin.watch();
  }

  // Autenticación
  const authProvider = new DefaultAuthProvider({
    componentLoader,
    authenticate: autenticarAdministrador,
  });

  // Sesiones en MySQL
  const SequelizeStore = connectSessionSequelize(session.Store);

  const sessionStore = new SequelizeStore({
    db: sequelize,
    tableName: "admin_sessions",
    checkExpirationInterval: 15 * 60 * 1000,
    expiration: 24 * 60 * 60 * 1000,
  });

  await sessionStore.sync();

  // Router protegido
  const adminRouter = AdminJSExpress.buildAuthenticatedRouter(
    admin,

    {
      provider: authProvider,
      cookieName: "inventario_facil_admin",
      cookiePassword: sessionSecret,
    },

    null,

    {
      store: sessionStore,
      secret: sessionSecret,
      resave: false,
      saveUninitialized: false,
      proxy: process.env.NODE_ENV === "production",
      name: "inventario_facil_admin",

      cookie: {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 24 * 60 * 60 * 1000,
      },
    },
  );

  return {
    admin,
    adminRouter,
  };
}
