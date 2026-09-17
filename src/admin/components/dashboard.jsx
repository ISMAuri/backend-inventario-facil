import React, { useEffect, useState } from "react";
import { ApiClient } from "adminjs";

const api = new ApiClient();

const formatearMoneda = (valor) => {
  return Number(valor ?? 0).toLocaleString("es-HN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

const formatearFecha = (valor) => {
  if (!valor) return "—";

  const coincidencia = String(valor).match(/\d{4}-\d{2}-\d{2}/);

  if (coincidencia) {
    const [anio, mes, dia] = coincidencia[0].split("-");
    return `${dia}/${mes}/${anio}`;
  }

  return "—";
};

const formatearFechaHora = (valor) => {
  if (!valor) return "—";

  const fecha = new Date(valor);

  if (Number.isNaN(fecha.getTime())) {
    return String(valor);
  }

  return fecha.toLocaleString("es-HN", {
    timeZone: "America/Tegucigalpa",
    dateStyle: "short",
    timeStyle: "short",
  });
};

const irA = (ruta) => {
  if (!ruta) return;
  window.location.assign(ruta);
};

const textoVigenciaFiscal = (dias) => {
  if (dias === null || dias === undefined) {
    return "Sin fecha límite disponible";
  }

  if (dias < 0) {
    const cantidad = Math.abs(dias);
    return `Venció hace ${cantidad} ${cantidad === 1 ? "día" : "días"}`;
  }

  if (dias === 0) {
    return "Vence hoy";
  }

  return `Vence en ${dias} ${dias === 1 ? "día" : "días"}`;
};

const Dashboard = () => {
  const [datos, setDatos] = useState(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    api
      .getDashboard()
      .then((response) => {
        setDatos(response.data);
      })
      .catch((error) => {
        console.error("Error al cargar dashboard:", error);
        setError(true);
      });
  }, []);

  if (error) {
    return (
      <div style={{ padding: "24px" }}>
        <h2>Error al cargar el dashboard</h2>
        <p>No se pudieron obtener las estadísticas.</p>
      </div>
    );
  }

  if (!datos) {
    return (
      <div style={{ padding: "24px" }}>
        <h2>Cargando dashboard...</h2>
      </div>
    );
  }

  const tarjetas = [
    {
      titulo: "Productos registrados",
      valor: datos.totalProductos ?? 0,
      descripcion: "Todos los productos registrados",
      color: "#4268F6",
      ruta: "/admin/resources/producto",
    },
    {
      titulo: "Clientes registrados",
      valor: datos.totalClientes ?? 0,
      descripcion: "Clientes en el sistema",
      color: "#5CB85C",
      ruta: "/admin/resources/cliente",
    },
    {
      titulo: "Ventas vigentes",
      valor: datos.ventasVigentes ?? 0,
      descripcion: "Facturas no anuladas",
      color: "#6F42C1",
      ruta: "/admin/resources/venta",
    },
    {
      titulo: "Stock bajo",
      valor: datos.stockBajo ?? 0,
      descripcion: "Productos activos con 1 a 10 unidades",
      color: "#F0AD4E",
      ruta: "/admin/resources/producto",
    },
    {
      titulo: "Productos agotados",
      valor: datos.productosAgotados ?? 0,
      descripcion: "Productos activos sin existencias",
      color: "#D9534F",
      ruta: "/admin/resources/producto",
    },
    {
      titulo: "Facturas anuladas",
      valor: datos.facturasAnuladas ?? 0,
      descripcion: "Facturas que fueron anuladas",
      color: "#777777",
      ruta: "/admin/resources/venta",
    },
    {
      titulo: "Total facturado",
      valor: `L. ${formatearMoneda(datos.totalFacturado)}`,
      descripcion: "Total histórico de facturas vigentes",
      color: "#00897B",
      ruta: "/admin/resources/venta",
    },
    {
      titulo: "Ventas hoy",
      valor: datos.ventasHoy ?? 0,
      descripcion: "Facturas vigentes emitidas hoy",
      color: "#2563EB",
      ruta: "/admin/resources/venta",
    },
    {
      titulo: "Facturado hoy",
      valor: `L. ${formatearMoneda(datos.facturadoHoy)}`,
      descripcion: "Total vigente facturado hoy",
      color: "#0F766E",
      ruta: "/admin/resources/venta",
    },
    {
      titulo: "Ventas este mes",
      valor: datos.ventasMes ?? 0,
      descripcion: "Facturas vigentes del mes actual",
      color: "#7C3AED",
      ruta: "/admin/resources/venta",
    },
    {
      titulo: "Facturado este mes",
      valor: `L. ${formatearMoneda(datos.facturadoMes)}`,
      descripcion: "Total vigente del mes actual",
      color: "#047857",
      ruta: "/admin/resources/venta",
    },
  ];

  const fiscal = datos.autorizacionFiscal;
  const fiscalVencida = fiscal?.diasParaVencer < 0;
  const fiscalPorVencer =
    fiscal?.diasParaVencer >= 0 && fiscal?.diasParaVencer <= 30;

  return (
    <div
      style={{
        padding: "24px",
        width: "100%",
        maxWidth: "1400px",
        margin: "0 auto",
        boxSizing: "border-box",
      }}
    >
      <div style={{ marginBottom: "34px" }}>
        <h1
          style={{
            margin: 0,
            fontSize: "34px",
            fontWeight: 600,
          }}
        >
          Inventario Fácil
        </h1>

        <p
          style={{
            marginTop: "12px",
            color: "#6B7280",
          }}
        >
          Resumen general del sistema
        </p>
      </div>

      <div
        role="link"
        tabIndex={0}
        onClick={() => irA("/admin/resources/autorizacion_factura")}
        onKeyDown={(evento) => {
          if (evento.key === "Enter") {
            irA("/admin/resources/autorizacion_factura");
          }
        }}
        style={{
          background: "#FFFFFF",
          borderRadius: "12px",
          padding: "22px",
          marginBottom: "26px",
          borderLeft: `6px solid ${
            !fiscal
              ? "#D9534F"
              : fiscalVencida
                ? "#D9534F"
                : fiscalPorVencer
                  ? "#F0AD4E"
                  : "#00897B"
          }`,
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)",
          cursor: "pointer",
          boxSizing: "border-box",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            gap: "20px",
            flexWrap: "wrap",
          }}
        >
          <div>
            <p
              style={{
                margin: 0,
                color: "#6B7280",
                fontSize: "14px",
                fontWeight: 600,
              }}
            >
              Autorización fiscal activa
            </p>

            <h2
              style={{
                margin: "8px 0 0",
                fontSize: "24px",
                overflowWrap: "anywhere",
              }}
            >
              {fiscal?.cai ?? "No hay una autorización fiscal activa"}
            </h2>
          </div>

          {fiscal && (
            <div
              style={{
                padding: "8px 12px",
                borderRadius: "999px",
                background: fiscalVencida
                  ? "#FDECEC"
                  : fiscalPorVencer
                    ? "#FFF4E5"
                    : "#E8F5E9",
                color: fiscalVencida
                  ? "#B42318"
                  : fiscalPorVencer
                    ? "#9A6700"
                    : "#176B3A",
                fontSize: "13px",
                fontWeight: 600,
              }}
            >
              {textoVigenciaFiscal(fiscal.diasParaVencer)}
            </div>
          )}
        </div>

        {fiscal && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
              gap: "18px",
              marginTop: "22px",
            }}
          >
            <div>
              <div style={{ color: "#9CA3AF", fontSize: "12px" }}>Serie</div>
              <div style={{ marginTop: "5px", fontWeight: 600 }}>
                {fiscal.serie}
              </div>
            </div>

            <div>
              <div style={{ color: "#9CA3AF", fontSize: "12px" }}>
                Fecha límite
              </div>
              <div style={{ marginTop: "5px", fontWeight: 600 }}>
                {formatearFecha(fiscal.fechaLimiteEmision)}
              </div>
            </div>

            <div>
              <div style={{ color: "#9CA3AF", fontSize: "12px" }}>
                Siguiente correlativo
              </div>
              <div style={{ marginTop: "5px", fontWeight: 600 }}>
                {fiscal.siguienteCorrelativo}
              </div>
            </div>

            <div>
              <div style={{ color: "#9CA3AF", fontSize: "12px" }}>
                Correlativos disponibles
              </div>
              <div style={{ marginTop: "5px", fontWeight: 600 }}>
                {Number(fiscal.correlativosDisponibles ?? 0).toLocaleString(
                  "es-HN",
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: "20px",
          width: "100%",
        }}
      >
        {tarjetas.map((tarjeta) => (
          <div
            key={tarjeta.titulo}
            role="link"
            tabIndex={0}
            onClick={() => irA(tarjeta.ruta)}
            onKeyDown={(evento) => {
              if (evento.key === "Enter") {
                irA(tarjeta.ruta);
              }
            }}
            style={{
              background: "#FFFFFF",
              borderRadius: "10px",
              padding: "20px",
              borderLeft: `5px solid ${tarjeta.color}`,
              boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)",
              boxSizing: "border-box",
              minWidth: 0,
              cursor: "pointer",
            }}
          >
            <p
              style={{
                margin: 0,
                color: "#6B7280",
                fontSize: "14px",
                fontWeight: 500,
              }}
            >
              {tarjeta.titulo}
            </p>

            <h2
              style={{
                marginTop: "10px",
                marginBottom: "8px",
                fontSize: "27px",
                overflowWrap: "anywhere",
              }}
            >
              {tarjeta.valor}
            </h2>

            <p
              style={{
                margin: 0,
                color: "#9CA3AF",
                fontSize: "12px",
              }}
            >
              {tarjeta.descripcion}
            </p>
          </div>
        ))}
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
          gap: "22px",
          marginTop: "30px",
        }}
      >
        <div
          style={{
            background: "#FFFFFF",
            borderRadius: "12px",
            padding: "20px",
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "16px",
              marginBottom: "16px",
            }}
          >
            <div>
              <h3 style={{ margin: 0 }}>Últimas ventas</h3>
              <p
                style={{
                  margin: "5px 0 0",
                  color: "#9CA3AF",
                  fontSize: "12px",
                }}
              >
                Las 7 facturas más recientes
              </p>
            </div>

            <button
              type="button"
              onClick={() => irA("/admin/resources/venta")}
              style={{
                border: 0,
                background: "transparent",
                color: "#4268F6",
                cursor: "pointer",
                fontWeight: 600,
              }}
            >
              Ver todas
            </button>
          </div>

          {(datos.ultimasVentas ?? []).length === 0 ? (
            <p style={{ color: "#9CA3AF" }}>
              Todavía no hay ventas registradas.
            </p>
          ) : (
            <div>
              {(datos.ultimasVentas ?? []).map((venta, indice) => (
                <div
                  key={venta.id_venta ?? `${venta.numero_factura}-${indice}`}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr auto",
                    gap: "12px",
                    padding: "12px 0",
                    borderBottom:
                      indice === datos.ultimasVentas.length - 1
                        ? "none"
                        : "1px solid #F0F0F0",
                  }}
                >
                  <div style={{ minWidth: 0 }}>
                    <div
                      style={{
                        fontWeight: 600,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {venta.numero_factura}
                    </div>

                    <div
                      style={{
                        marginTop: "4px",
                        color: "#6B7280",
                        fontSize: "12px",
                      }}
                    >
                      {venta.cliente_nombre_factura || "Consumidor Final"} ·{" "}
                      {formatearFechaHora(venta.fecha_venta)}
                    </div>
                  </div>

                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontWeight: 600 }}>
                      L. {formatearMoneda(venta.total)}
                    </div>

                    <div
                      style={{
                        marginTop: "4px",
                        fontSize: "11px",
                        fontWeight: 600,
                        color: venta.estado_factura ? "#176B3A" : "#B42318",
                      }}
                    >
                      {venta.estado_factura ? "Vigente" : "Anulada"}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div
          style={{
            background: "#FFFFFF",
            borderRadius: "12px",
            padding: "20px",
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "16px",
              marginBottom: "16px",
            }}
          >
            <div>
              <h3 style={{ margin: 0 }}>Productos con menor stock</h3>
              <p
                style={{
                  margin: "5px 0 0",
                  color: "#9CA3AF",
                  fontSize: "12px",
                }}
              >
                Los 5 productos activos con menos existencias
              </p>
            </div>

            <button
              type="button"
              onClick={() => irA("/admin/resources/producto")}
              style={{
                border: 0,
                background: "transparent",
                color: "#4268F6",
                cursor: "pointer",
                fontWeight: 600,
              }}
            >
              Ver productos
            </button>
          </div>

          {(datos.productosStockCritico ?? []).length === 0 ? (
            <p style={{ color: "#9CA3AF" }}>
              No hay productos activos registrados.
            </p>
          ) : (
            <div>
              {(datos.productosStockCritico ?? []).map((producto, indice) => {
                const stock = Number(producto.stock_actual ?? 0);

                return (
                  <div
                    key={
                      producto.id_producto ??
                      `${producto.nombre_producto}-${indice}`
                    }
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr auto",
                      gap: "12px",
                      padding: "12px 0",
                      borderBottom:
                        indice === datos.productosStockCritico.length - 1
                          ? "none"
                          : "1px solid #F0F0F0",
                    }}
                  >
                    <div style={{ minWidth: 0 }}>
                      <div
                        style={{
                          fontWeight: 600,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {producto.nombre_producto}
                      </div>

                      <div
                        style={{
                          marginTop: "4px",
                          color: "#9CA3AF",
                          fontSize: "12px",
                        }}
                      >
                        {producto.codigo_producto || "Sin código"}
                      </div>
                    </div>

                    <div
                      style={{
                        alignSelf: "center",
                        padding: "6px 10px",
                        borderRadius: "999px",
                        background: stock === 0 ? "#FDECEC" : "#FFF4E5",
                        color: stock === 0 ? "#B42318" : "#9A6700",
                        fontSize: "12px",
                        fontWeight: 700,
                        whiteSpace: "nowrap",
                      }}
                    >
                      {stock} {stock === 1 ? "unidad" : "unidades"}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
