import React, { useEffect, useState } from "react";
import { ApiClient } from "adminjs";

const api = new ApiClient();

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

  const totalFacturado = Number(datos.totalFacturado ?? 0).toLocaleString(
    "es-HN",
    {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    },
  );

  const tarjetas = [
    {
      titulo: "Productos registrados",
      valor: datos.totalProductos ?? 0,
      descripcion: "Productos en el sistema",
      color: "#4268F6",
    },
    {
      titulo: "Clientes registrados",
      valor: datos.totalClientes ?? 0,
      descripcion: "Clientes en el sistema",
      color: "#5CB85C",
    },
    {
      titulo: "Ventas realizadas",
      valor: datos.totalVentas ?? 0,
      descripcion: "Facturas registradas",
      color: "#6F42C1",
    },
    {
      titulo: "Stock bajo",
      valor: datos.stockBajo ?? 0,
      descripcion: "Productos con 1 a 10 unidades",
      color: "#F0AD4E",
    },
    {
      titulo: "Productos agotados",
      valor: datos.productosAgotados ?? datos.agotados ?? 0,
      descripcion: "Productos sin existencias",
      color: "#D9534F",
    },
    {
      titulo: "Facturas anuladas",
      valor: datos.facturasAnuladas ?? datos.ventasAnuladas ?? 0,
      descripcion: "Facturas que fueron anuladas",
      color: "#777777",
    },
    {
      titulo: "Total facturado",
      valor: `L. ${totalFacturado}`,
      descripcion: "Total de facturas emitidas",
      color: "#00897B",
    },
  ];

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
      <div style={{ marginBottom: "50px" }}>
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
            marginTop: "18px",
            color: "#6B7280",
          }}
        >
          Resumen general del sistema
        </p>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))",
          gap: "26px",
          width: "100%",
        }}
      >
        {tarjetas.map((tarjeta) => (
          <div
            key={tarjeta.titulo}
            style={{
              background: "#FFFFFF",
              borderRadius: "10px",
              padding: "20px",
              borderLeft: `5px solid ${tarjeta.color}`,
              boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)",
              boxSizing: "border-box",
              minWidth: 0,
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
    </div>
  );
};

export default Dashboard;
