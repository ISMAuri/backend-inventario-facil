const PDFDocument = require("pdfkit");

const MARGEN = 42;
const ANCHO_PAGINA = 612;
const ANCHO_UTIL = ANCHO_PAGINA - MARGEN * 2;

/*
|--------------------------------------------------------------------------
| Utilidades
|--------------------------------------------------------------------------
*/

function textoSeguro(valor, porDefecto = "") {
  if (valor === null || valor === undefined) {
    return porDefecto;
  }

  return String(valor).trim();
}

function numero(valor) {
  const n = Number(valor);

  return Number.isFinite(n) ? n : 0;
}

function moneda(valor) {
  return `L. ${numero(valor).toFixed(2)}`;
}

function fecha(valor, incluirHora = false) {
  if (!valor) {
    return "";
  }

  const f = new Date(valor);

  if (Number.isNaN(f.getTime())) {
    return textoSeguro(valor);
  }

  const dia = String(f.getDate()).padStart(2, "0");
  const mes = String(f.getMonth() + 1).padStart(2, "0");
  const anio = f.getFullYear();

  if (!incluirHora) {
    return `${dia}/${mes}/${anio}`;
  }

  let horas = f.getHours();

  const minutos = String(f.getMinutes()).padStart(2, "0");

  const periodo = horas >= 12 ? "p. m." : "a. m.";

  horas %= 12;
  horas = horas || 12;

  return `${dia}/${mes}/${anio}, ${horas}:${minutos} ${periodo}`;
}

/*
|--------------------------------------------------------------------------
| Alto dinámico de la factura
|--------------------------------------------------------------------------
|
| La factura siempre tendrá una sola página.
| Si tiene más productos, simplemente aumenta su altura.
|
*/

function calcularAltoFactura(venta, detalles = []) {
  // Altura necesaria para:
  // encabezado, cliente, datos fiscales,
  // resumen, total y pie.
  let alto = 780;

  // Cada producto necesita aproximadamente
  // este espacio.
  for (const detalle of detalles) {
    const codigo = textoSeguro(detalle.producto_codigo_factura, "N/A");

    const nombre = textoSeguro(detalle.producto_nombre_factura, "Producto");

    const lineasCodigo = Math.max(1, Math.ceil(codigo.length / 12));

    const lineasNombre = Math.max(1, Math.ceil(nombre.length / 32));

    const lineasFila = Math.max(lineasCodigo, lineasNombre);

    alto += 20;

    if (lineasFila > 1) {
      alto += (lineasFila - 1) * 11;
    }
  }

  // Espacio extra si algunas direcciones
  // son largas.
  if (textoSeguro(venta.empresa_direccion_factura).length > 60) {
    alto += 20;
  }

  if (textoSeguro(venta.cliente_direccion_factura).length > 60) {
    alto += 20;
  }

  // Margen extra de seguridad.
  alto += 80;

  return alto;
}

/*
|--------------------------------------------------------------------------
| Líneas
|--------------------------------------------------------------------------
*/

function linea(doc, y, xInicio = MARGEN, xFin = ANCHO_PAGINA - MARGEN) {
  doc
    .moveTo(xInicio, y)
    .lineTo(xFin, y)
    .lineWidth(0.6)
    .strokeColor("#777777")
    .stroke();

  doc.strokeColor("#000000");
}

/*
|--------------------------------------------------------------------------
| Títulos centrados
|--------------------------------------------------------------------------
*/

function tituloCentrado(doc, texto, tamanio = 12, negrita = true) {
  doc
    .font(negrita ? "Helvetica-Bold" : "Helvetica")
    .fontSize(tamanio)
    .fillColor("#000000")
    .text(texto, MARGEN, doc.y, {
      width: ANCHO_UTIL,
      align: "center",
    });
}

/*
|--------------------------------------------------------------------------
| Etiqueta + valor
|--------------------------------------------------------------------------
*/

function etiquetaValor(doc, etiqueta, valor, opciones = {}) {
  const {
    negritaEtiqueta = true,
    tamanio = 9.5,
    anchoEtiqueta = 170,
    espacioDespues = 3,
  } = opciones;

  const y = doc.y;

  doc
    .font(negritaEtiqueta ? "Helvetica-Bold" : "Helvetica")
    .fontSize(tamanio)
    .fillColor("#000000")
    .text(etiqueta, MARGEN, y, {
      width: anchoEtiqueta,
    });

  doc
    .font("Helvetica")
    .fontSize(tamanio)
    .text(textoSeguro(valor, ""), MARGEN + anchoEtiqueta, y, {
      width: ANCHO_UTIL - anchoEtiqueta,
    });

  const altoEtiqueta = doc.heightOfString(etiqueta, {
    width: anchoEtiqueta,
  });

  const altoValor = doc.heightOfString(textoSeguro(valor, ""), {
    width: ANCHO_UTIL - anchoEtiqueta,
  });

  doc.y = y + Math.max(altoEtiqueta, altoValor) + espacioDespues;
}

/*
|--------------------------------------------------------------------------
| Estado de la factura
|--------------------------------------------------------------------------
*/

function dibujarEstado(doc, venta) {
  const anulada =
    venta.estado_factura === false ||
    venta.estado_factura === 0 ||
    venta.estado_factura === "0";

  // doc.moveDown(0.25);

  // doc
  //   .font("Helvetica-Bold")
  //   .fontSize(13)
  //   .text(anulada ? "ANULADA" : "EMITIDA", MARGEN, doc.y, {
  //     width: ANCHO_UTIL,
  //     align: "center",
  //   });

  if (anulada) {
    /*
    |--------------------------------------------------------------------------
    | Guardamos dónde iba la factura antes
    | de dibujar la marca de agua.
    |--------------------------------------------------------------------------
    */

    const xOriginal = doc.x;
    const yOriginal = doc.y;

    const xCentro = ANCHO_PAGINA / 2;

    const yCentro = doc.page.height / 2;

    doc.save();

    doc
      .fillColor("#777777")
      .opacity(0.11)
      .font("Helvetica-Bold")
      .fontSize(70)
      .rotate(-35, {
        origin: [xCentro, yCentro],
      })
      .text("ANULADA", 70, yCentro - 40, {
        width: ANCHO_PAGINA - 140,
        align: "center",
        lineBreak: false,
      });

    doc.restore();

    doc.opacity(1);

    doc.fillColor("#000000");

    /*
    |--------------------------------------------------------------------------
    | Regresamos el cursor a donde estaba.
    |--------------------------------------------------------------------------
    */

    doc.x = xOriginal;
    doc.y = yOriginal;
  }
}

/*
|--------------------------------------------------------------------------
| Encabezado
|--------------------------------------------------------------------------
*/

function dibujarEncabezado(doc, venta) {
  // tituloCentrado(doc, "FACTURA", 20, true);

  doc.moveDown(0.35);

  tituloCentrado(
    doc,
    textoSeguro(venta.empresa_razon_social_factura, "EMPRESA"),
    14,
    true,
  );

  // if (venta.empresa_razon_social_factura) {
  //   doc.moveDown(0.1);

  //   tituloCentrado(
  //     doc,
  //     textoSeguro(venta.empresa_razon_social_factura),
  //     10,
  //     false,
  //   );
  // }

  doc.moveDown(0.2);

  if (venta.empresa_rtn_factura) {
    tituloCentrado(
      doc,
      `RTN: ${textoSeguro(venta.empresa_rtn_factura)}`,
      9.5,
      false,
    );
  }

  if (venta.empresa_telefono_factura) {
    tituloCentrado(
      doc,
      `Tel: +504 ${textoSeguro(venta.empresa_telefono_factura)}`,
      9.5,
      false,
    );
  }

  if (venta.empresa_correo_factura) {
    tituloCentrado(
      doc,
      `Email: ${textoSeguro(venta.empresa_correo_factura)}`,
      9.5,
      false,
    );
  }

  if (venta.empresa_direccion_factura) {
    doc.moveDown(0.1);

    doc
      .font("Helvetica")
      .fontSize(9.5)
      .text(
        `Dirección: ${textoSeguro(venta.empresa_direccion_factura)}`,
        MARGEN + 25,
        doc.y,
        {
          width: ANCHO_UTIL - 50,
          align: "center",
        },
      );
  }

  doc.moveDown(0.6);

  /*
  |--------------------------------------------------------------------------
  | Datos de autorización
  |--------------------------------------------------------------------------
  */

  tituloCentrado(
    doc,
    `CAI: ${textoSeguro(venta.cai_factura, "N/A")}`,
    9.5,
    false,
  );

  tituloCentrado(
    doc,
    `Rango autorizado: ${textoSeguro(
      venta.rango_inicial_factura,
      "N/A",
    )} al ${textoSeguro(venta.rango_final_factura, "N/A")}`,
    9.5,
    false,
  );

  tituloCentrado(
    doc,
    `Fecha de autorización: ${fecha(venta.fecha_autorizacion_factura)}`,
    9.5,
    false,
  );

  tituloCentrado(
    doc,
    `Fecha límite de emisión: ${fecha(venta.fecha_limite_emision_factura)}`,
    9.5,
    false,
  );

  doc.moveDown(0.45);

  /*
  |--------------------------------------------------------------------------
  | Número de factura
  |--------------------------------------------------------------------------
  */

  tituloCentrado(
    doc,
    `Factura No.: ${textoSeguro(venta.numero_factura, "N/A")}`,
    14,
    false,
  );

  tituloCentrado(doc, `Fecha: ${fecha(venta.fecha_venta, true)}`, 9.5, false);

  dibujarEstado(doc, venta);

  doc.moveDown(0.7);
}

/*
|--------------------------------------------------------------------------
| Datos del cliente
|--------------------------------------------------------------------------
*/

function dibujarCliente(doc, venta) {
  doc.font("Helvetica-Bold").fontSize(12).text("CLIENTE");

  doc.moveDown(0.25);

  etiquetaValor(
    doc,
    "Nombre:",
    textoSeguro(venta.cliente_nombre_factura, "Consumidor Final"),
    {
      anchoEtiqueta: 60,
    },
  );

  etiquetaValor(
    doc,
    "RTN:",
    textoSeguro(venta.cliente_rtn_factura, "N/A") || "N/A",
    {
      anchoEtiqueta: 60,
    },
  );

  if (venta.cliente_direccion_factura) {
    etiquetaValor(
      doc,
      "Dirección:",
      textoSeguro(venta.cliente_direccion_factura),
      {
        anchoEtiqueta: 60,
      },
    );
  }

  if (venta.cliente_telefono_factura) {
    etiquetaValor(
      doc,
      "Teléfono: +504 ",
      textoSeguro(venta.cliente_telefono_factura),
      {
        anchoEtiqueta: 60,
      },
    );
  }

  linea(doc, doc.y + 2);

  doc.y += 10;

  etiquetaValor(
    doc,
    "Vendedor:",
    textoSeguro(venta.usuario_nombre_factura, "N/A"),
    {
      anchoEtiqueta: 60,
    },
  );

  linea(doc, doc.y + 2);

  doc.y += 10;
}

/*
|--------------------------------------------------------------------------
| Orden exenta / exonerados / SAG
|--------------------------------------------------------------------------
|
| Estos tres campos SIEMPRE se dibujan,
| aunque estén vacíos.
|
*/

function dibujarDatosExoneracion(doc, venta) {
  etiquetaValor(
    doc,
    "No. de Orden de Compra Exenta:",
    textoSeguro(venta.orden_compra_exenta, ""),
  );

  etiquetaValor(
    doc,
    "No. de Constancia Registro Exonerados:",
    textoSeguro(venta.constancia_registro_exonerados, ""),
  );

  etiquetaValor(
    doc,
    "No. Identificativo de Registro de la SAG:",
    textoSeguro(venta.registro_sag, ""),
  );

  linea(doc, doc.y + 11);

  doc.y += 18;
}

/*
|--------------------------------------------------------------------------
| Encabezado de tabla
|--------------------------------------------------------------------------
*/

function encabezadoTabla(doc, y) {
  const xCodigo = MARGEN;

  const xProducto = 120;

  const xCantidad = 345;

  const xPrecio = 405;

  const xTotal = 492;

  doc
    .font("Helvetica-Bold")
    .fontSize(9.5)
    .text("Código", xCodigo, y, {
      width: 70,
    })
    .text("Producto", xProducto, y, {
      width: 215,
    })
    .text("Cant.", xCantidad, y, {
      width: 50,
      align: "center",
    })
    .text("P. Unit", xPrecio, y, {
      width: 72,
      align: "right",
    })
    .text("Precio", xTotal, y, {
      width: 78,
      align: "right",
    });

  linea(doc, y + 15);

  doc.y = y + 20;
}

/*
|--------------------------------------------------------------------------
| Detalle de productos
|--------------------------------------------------------------------------
*/

function dibujarDetalle(doc, detalles) {
  tituloCentrado(doc, "DESCRIPCIÓN", 12, true);

  doc.moveDown(0.5);

  encabezadoTabla(doc, doc.y);

  for (const detalle of detalles) {
    const codigo = textoSeguro(detalle.producto_codigo_factura, "N/A");

    const nombre = textoSeguro(detalle.producto_nombre_factura, "Producto");

    const cantidad = numero(detalle.cantidad);

    const precioUnitario = numero(detalle.precio_unitario);

    const importe = numero(detalle.subtotal);

    const altoCodigo = doc.heightOfString(codigo, {
      width: 70,
    });

    const altoNombre = doc.heightOfString(nombre, {
      width: 215,
    });

    const altoFila = Math.max(18, altoCodigo + 4, altoNombre + 4);

    const y = doc.y;

    doc
      .font("Helvetica")
      .fontSize(9.2)
      .text(codigo, MARGEN, y, {
        width: 70,
      })
      .text(nombre, 120, y, {
        width: 215,
      })
      .text(String(cantidad), 345, y, {
        width: 50,
        align: "center",
      })
      .text(precioUnitario.toFixed(2), 405, y, {
        width: 72,
        align: "right",
      })
      .text(importe.toFixed(2), 492, y, {
        width: 78,
        align: "right",
      });

    doc.y = y + altoFila;
  }

  linea(doc, doc.y + 2);

  doc.y += 12;
}

/*
|--------------------------------------------------------------------------
| Filas de totales
|--------------------------------------------------------------------------
*/

function filaTotal(doc, etiqueta, valor, opciones = {}) {
  const { negrita = false, tamanio = 10 } = opciones;

  const y = doc.y;

  doc
    .font(negrita ? "Helvetica-Bold" : "Helvetica")
    .fontSize(tamanio)
    .text(etiqueta, MARGEN, y, {
      width: 360,
    })
    .text(moneda(valor), 410, y, {
      width: 160,
      align: "right",
    });

  doc.y = y + tamanio + 5;
}

/*
|--------------------------------------------------------------------------
| Totales
|--------------------------------------------------------------------------
*/

function dibujarTotales(doc, venta) {
  filaTotal(doc, "DESCUENTOS/REBAJAS", venta.total_descuentos);

  filaTotal(doc, "IMPORTE EXONERADO", venta.total_exonerado);

  filaTotal(doc, "IMPORTE EXENTO", venta.total_exento);

  // filaTotal(
  //   doc,
  //   "IMPORTE TASA 0%",
  //   venta.total_tasa_cero,
  // );

  filaTotal(doc, "IMPORTE GRAVADO 15%", venta.total_gravado_15);

  filaTotal(doc, "IMPORTE GRAVADO 18%", venta.total_gravado_18);

  filaTotal(doc, "ISV 15%", venta.total_isv_15);

  filaTotal(doc, "ISV 18%", venta.total_isv_18);

  filaTotal(
    doc,
    "IMPUESTO TOTAL",
    numero(venta.total_isv_15) + numero(venta.total_isv_18),
  );

  doc.moveDown(0.25);

  filaTotal(doc, "TOTAL A PAGAR", venta.total, {
    negrita: true,
    tamanio: 13,
  });

  doc.moveDown(0.25);

  /*
  |--------------------------------------------------------------------------
  | Total en letras
  |--------------------------------------------------------------------------
  */

  doc
    .font("Helvetica-Bold")
    .fontSize(9.5)
    .text(textoSeguro(venta.total_letras, ""), MARGEN, doc.y, {
      width: ANCHO_UTIL,
    });

  doc.moveDown(0.65);

  /*
  |--------------------------------------------------------------------------
  | Método de pago
  |--------------------------------------------------------------------------
  */

  etiquetaValor(doc, "Método de Pago:", textoSeguro(venta.metodo_pago, ""), {
    anchoEtiqueta: 160,
    tamanio: 10,
  });

  linea(doc, doc.y + 2);

  doc.y += 10;
}

/*
|--------------------------------------------------------------------------
| Pie de factura
|--------------------------------------------------------------------------
*/

function dibujarPie(doc) {
  doc.moveDown(1);

  doc
    .font("Helvetica")
    .fontSize(9)
    .fillColor("#555555")
    .text("Original: Cliente", MARGEN, doc.y, {
      width: ANCHO_UTIL,
      align: "center",
    });

  doc.moveDown(1);

  doc
    .font("Helvetica")
    .fontSize(9)
    .fillColor("#555555")
    .text("Copia: Emisor", MARGEN, doc.y, {
      width: ANCHO_UTIL,
      align: "center",
    });

  doc.moveDown(0.5);

  doc.fillColor("#000000");
}

/*
|--------------------------------------------------------------------------
| Generar factura
|--------------------------------------------------------------------------
*/

function generarFacturaPdf(venta, detalles = []) {
  /*
  |--------------------------------------------------------------------------
  | Calculamos primero cuánto debe medir la página.
  |--------------------------------------------------------------------------
  */

  const altoFactura = calcularAltoFactura(venta, detalles);

  /*
  |--------------------------------------------------------------------------
  | Página personalizada:
  |
  | ancho fijo
  | alto variable
  |--------------------------------------------------------------------------
  */

  const doc = new PDFDocument({
    size: [ANCHO_PAGINA, altoFactura],

    margins: {
      top: MARGEN,
      bottom: 45,
      left: MARGEN,
      right: MARGEN,
    },

    info: {
      Title: `Factura ${textoSeguro(venta.numero_factura)}`,

      Author: textoSeguro(venta.empresa_nombre_factura),

      Subject: "Factura",

      Creator: "Inventario Fácil",
    },
  });

  dibujarEncabezado(doc, venta);

  dibujarCliente(doc, venta);

  dibujarDatosExoneracion(doc, venta);

  dibujarDetalle(doc, detalles);

  dibujarTotales(doc, venta);

  dibujarPie(doc);

  return doc;
}

module.exports = {
  generarFacturaPdf,
};
