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

// Zona horaria usada por el negocio
const ZONA_HORARIA = "America/Tegucigalpa";
const OFFSET_HONDURAS = "-06:00";

const MS_POR_DIA = 24 * 60 * 60 * 1000;

const rellenar = (valor) => String(valor).padStart(2, "0");

// Obtiene la fecha actual según Honduras
const obtenerFechaLocal = (fecha = new Date()) => {
  const partes = new Intl.DateTimeFormat("en-CA", {
    timeZone: ZONA_HORARIA,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(fecha);

  const valores = {};

  for (const parte of partes) {
    if (parte.type !== "literal") {
      valores[parte.type] = parte.value;
    }
  }

  return {
    anio: Number(valores.year),
    mes: Number(valores.month),
    dia: Number(valores.day),
  };
};

// Crea una fecha usando horario de Honduras
const crearFechaLocal = (anio, mes, dia) => {
  return new Date(
    `${anio}-${rellenar(mes)}-${rellenar(dia)}T00:00:00${OFFSET_HONDURAS}`,
  );
};

// Suma días sin depender de la zona horaria del servidor
const sumarDiasCalendario = ({ anio, mes, dia }, cantidad) => {
  const fecha = new Date(Date.UTC(anio, mes - 1, dia + cantidad));

  return {
    anio: fecha.getUTCFullYear(),
    mes: fecha.getUTCMonth() + 1,
    dia: fecha.getUTCDate(),
  };
};

// Genera los rangos necesarios para hoy y este mes
const obtenerRangosTemporales = () => {
  const hoy = obtenerFechaLocal();
  const manana = sumarDiasCalendario(hoy, 1);

  const siguienteMes = new Date(Date.UTC(hoy.anio, hoy.mes, 1));

  return {
    hoy,

    inicioHoy: crearFechaLocal(hoy.anio, hoy.mes, hoy.dia),

    inicioManana: crearFechaLocal(manana.anio, manana.mes, manana.dia),

    inicioMes: crearFechaLocal(hoy.anio, hoy.mes, 1),

    inicioMesSiguiente: crearFechaLocal(
      siguienteMes.getUTCFullYear(),
      siguienteMes.getUTCMonth() + 1,
      1,
    ),
  };
};

// Normaliza una fecha al formato YYYY-MM-DD
const normalizarFechaSoloDia = (valor) => {
  if (!valor) return null;

  if (valor instanceof Date) {
    return `${valor.getUTCFullYear()}-${rellenar(
      valor.getUTCMonth() + 1,
    )}-${rellenar(valor.getUTCDate())}`;
  }

  const coincidencia = String(valor).match(/\d{4}-\d{2}-\d{2}/);

  return coincidencia?.[0] ?? null;
};

// Calcula cuántos días faltan para una fecha
const calcularDiasHasta = (fechaLimite, hoy) => {
  const fechaTexto = normalizarFechaSoloDia(fechaLimite);

  if (!fechaTexto) {
    return null;
  }

  const [anio, mes, dia] = fechaTexto.split("-").map(Number);

  const limiteUtc = Date.UTC(anio, mes - 1, dia);

  const hoyUtc = Date.UTC(hoy.anio, hoy.mes - 1, hoy.dia);

  return Math.round((limiteUtc - hoyUtc) / MS_POR_DIA);
};

// -----------------------------------------------------
// NAVEGACIÓN
// -----------------------------------------------------

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

// -----------------------------------------------------
// ACCIONES
// -----------------------------------------------------

// Bloquea cualquier modificación
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

// Permite crear y editar,
// pero evita eliminación física
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

// -----------------------------------------------------
// USUARIOS
// -----------------------------------------------------

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

// -----------------------------------------------------
// DASHBOARD
// -----------------------------------------------------

const dashboardHandler = async () => {
  const { hoy, inicioHoy, inicioManana, inicioMes, inicioMesSiguiente } =
    obtenerRangosTemporales();

  // Solo ventas que siguen vigentes
  const filtroVentasVigentes = {
    estado_factura: true,
  };

  // Ventas vigentes realizadas hoy
  const filtroVentasHoy = {
    estado_factura: true,

    fecha_venta: {
      [Op.gte]: inicioHoy,
      [Op.lt]: inicioManana,
    },
  };

  // Ventas vigentes del mes actual
  const filtroVentasMes = {
    estado_factura: true,

    fecha_venta: {
      [Op.gte]: inicioMes,
      [Op.lt]: inicioMesSiguiente,
    },
  };

  const [
    totalProductos,
    totalClientes,
    ventasVigentes,
    stockBajo,
    productosAgotados,
    facturasAnuladas,
    totalFacturado,
    ventasHoy,
    facturadoHoy,
    ventasMes,
    facturadoMes,
    autorizacionActiva,
    ultimasVentas,
    productosStockCritico,
  ] = await Promise.all([
    // Incluye productos activos e inactivos
    Producto.count(),

    // Todos los clientes registrados
    Cliente.count(),

    // Solo facturas vigentes
    Venta.count({
      where: filtroVentasVigentes,
    }),

    // Productos activos con stock entre 1 y 10
    Producto.count({
      where: {
        estado: true,

        stock_actual: {
          [Op.gt]: 0,
          [Op.lte]: 10,
        },
      },
    }),

    // Productos activos sin existencias
    Producto.count({
      where: {
        estado: true,
        stock_actual: 0,
      },
    }),

    // Facturas anuladas
    Venta.count({
      where: {
        estado_factura: false,
      },
    }),

    // Total histórico facturado,
    // excluyendo facturas anuladas
    Venta.sum("total", {
      where: filtroVentasVigentes,
    }),

    // Cantidad de ventas de hoy
    Venta.count({
      where: filtroVentasHoy,
    }),

    // Total facturado hoy
    Venta.sum("total", {
      where: filtroVentasHoy,
    }),

    // Cantidad de ventas del mes
    Venta.count({
      where: filtroVentasMes,
    }),

    // Total facturado este mes
    Venta.sum("total", {
      where: filtroVentasMes,
    }),

    // Autorización fiscal activa
    AutorizacionFactura.findOne({
      where: {
        estado: true,
      },

      order: [
        ["fecha_autorizacion", "DESC"],
        ["id_autorizacion", "DESC"],
      ],

      raw: true,
    }),

    // Últimas 7 ventas.
    // Incluye anuladas para mostrar actividad real.
    Venta.findAll({
      attributes: [
        "id_venta",
        "numero_factura",
        "cliente_nombre_factura",
        "fecha_venta",
        "total",
        "estado_factura",
      ],

      order: [
        ["fecha_venta", "DESC"],
        ["id_venta", "DESC"],
      ],

      limit: 7,
      raw: true,
    }),

    // 5 productos activos con menor stock
    Producto.findAll({
      where: {
        estado: true,
      },

      attributes: [
        "id_producto",
        "codigo_producto",
        "nombre_producto",
        "stock_actual",
      ],

      order: [
        ["stock_actual", "ASC"],
        ["nombre_producto", "ASC"],
      ],

      limit: 5,
      raw: true,
    }),
  ]);

  // ---------------------------------------------------
  // INFORMACIÓN FISCAL
  // ---------------------------------------------------

  let autorizacionFiscal = null;

  if (autorizacionActiva) {
    const siguienteCorrelativo = Number(
      autorizacionActiva.siguiente_correlativo,
    );

    const rangoFinal = Number(autorizacionActiva.rango_final);

    autorizacionFiscal = {
      idAutorizacion: autorizacionActiva.id_autorizacion,

      cai: autorizacionActiva.cai,

      serie:
        `${autorizacionActiva.establecimiento}-` +
        `${autorizacionActiva.punto_emision}-` +
        `${autorizacionActiva.tipo_documento}`,

      fechaLimiteEmision: normalizarFechaSoloDia(
        autorizacionActiva.fecha_limite_emision,
      ),

      diasParaVencer: calcularDiasHasta(
        autorizacionActiva.fecha_limite_emision,
        hoy,
      ),

      siguienteCorrelativo,

      rangoFinal,

      correlativosDisponibles: Math.max(
        rangoFinal - siguienteCorrelativo + 1,
        0,
      ),
    };
  }

  return {
    totalProductos,
    totalClientes,

    ventasVigentes,

    stockBajo,
    productosAgotados,

    facturasAnuladas,

    totalFacturado: Number(totalFacturado ?? 0),

    ventasHoy,

    facturadoHoy: Number(facturadoHoy ?? 0),

    ventasMes,

    facturadoMes: Number(facturadoMes ?? 0),

    autorizacionFiscal,

    ultimasVentas,

    productosStockCritico,
  };
};

// -----------------------------------------------------
// ADMINJS
// -----------------------------------------------------

export async function crearAdminRouter() {
  const sessionSecret = process.env.ADMIN_SESSION_SECRET;

  if (!sessionSecret) {
    throw new Error("ADMIN_SESSION_SECRET no está configurada.");
  }

  const admin = new AdminJS({
    rootPath: "/admin",

    // AdminJS en español
    locale: {
      language: "es",
      availableLanguages: ["es"],
    },

    componentLoader,

    dashboard: {
      component: Dashboard,
      handler: dashboardHandler,
    },

    resources: [
      // -------------------------------------------------
      // CATEGORÍAS
      // -------------------------------------------------
      {
        resource: Categoria,

        options: {
          navigation: navegacionInventario,

          actions: {
            ...accionesSinEliminar,
          },
        },
      },

      // -------------------------------------------------
      // PRODUCTOS
      // -------------------------------------------------
      {
        resource: Producto,

        options: {
          navigation: navegacionInventario,

          actions: {
            ...accionesSinEliminar,
          },

          properties: {
            // El stock debe cambiar
            // mediante movimientos.
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

      // -------------------------------------------------
      // MOVIMIENTOS DE INVENTARIO
      // -------------------------------------------------
      {
        resource: MovimientoInventario,

        options: {
          navigation: navegacionInventario,

          actions: {
            ...accionesSoloLectura,
          },
        },
      },

      // -------------------------------------------------
      // CLIENTES
      // -------------------------------------------------
      {
        resource: Cliente,

        options: {
          navigation: navegacionVentas,

          actions: {
            ...accionesSinEliminar,
          },
        },
      },

      // -------------------------------------------------
      // VENTAS
      // -------------------------------------------------
      {
        resource: Venta,

        options: {
          navigation: navegacionVentas,

          actions: {
            ...accionesSoloLectura,
          },
        },
      },

      // -------------------------------------------------
      // DETALLES DE VENTA
      // -------------------------------------------------
      {
        resource: DetalleVenta,

        options: {
          navigation: navegacionVentas,

          actions: {
            ...accionesSoloLectura,
          },
        },
      },

      // -------------------------------------------------
      // EMPRESA
      // -------------------------------------------------
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

      // -------------------------------------------------
      // AUTORIZACIONES FISCALES
      // -------------------------------------------------
      {
        resource: AutorizacionFactura,

        options: {
          navigation: navegacionConfiguracion,

          actions: {
            ...accionesSoloLectura,
          },
        },
      },

      // -------------------------------------------------
      // USUARIOS
      // -------------------------------------------------
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
      // logo: "/app-icon.png",
      favicon: "/app-icon.png",
    },
  });

  // Recompila componentes personalizados
  // cuando cambia el código en desarrollo.
  if (process.env.NODE_ENV === "development") {
    admin.watch();
  }

  // ---------------------------------------------------
  // AUTENTICACIÓN
  // ---------------------------------------------------

  const authProvider = new DefaultAuthProvider({
    componentLoader,

    authenticate: autenticarAdministrador,
  });

  // ---------------------------------------------------
  // SESIONES EN MYSQL
  // ---------------------------------------------------

  const SequelizeStore = connectSessionSequelize(session.Store);

  const sessionStore = new SequelizeStore({
    db: sequelize,

    tableName: "admin_sessions",

    checkExpirationInterval: 15 * 60 * 1000,

    expiration: 24 * 60 * 60 * 1000,
  });

  await sessionStore.sync();

  // ---------------------------------------------------
  // ROUTER PROTEGIDO
  // ---------------------------------------------------

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
