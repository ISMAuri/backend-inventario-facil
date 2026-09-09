const fs = require("fs");

const { generarFacturaPdf } = require("./src/utils/factura_pdf");

const venta = {
  id_venta: 1,

  usuario_nombre_factura: "Administrador",

  numero_factura: "001-001-01-00000011",
  correlativo: 11,
  
  cai_factura: "123456-123456-123456-123456-123456-AA",

  rango_inicial_factura: "001-001-01-00000001",

  rango_final_factura: "001-001-01-00002000",

  fecha_autorizacion_factura: "2025-12-31",

  fecha_limite_emision_factura: "2026-12-31",

  empresa_nombre_factura: "Inversiones Sammy",

  empresa_razon_social_factura: "Inversiones Sammy S. de R.L.",

  empresa_rtn_factura: "01079016892580",

  empresa_direccion_factura: "Roatán, Islas de la Bahía, Honduras",

  empresa_telefono_factura: "97547973",

  empresa_correo_factura: "inversionesammy2019@hotmail.com",

  cliente_nombre_factura: "Consumidor Final",

  cliente_rtn_factura: null,

  cliente_direccion_factura: null,

  cliente_telefono_factura: null,

  orden_compra_exenta: null,
  constancia_registro_exonerados: null,
  registro_sag: null,

  fecha_venta: new Date(),

  total_descuentos: 0,
  total_exonerado: 0,
  total_exento: 0,
  total_tasa_cero: 0,

  total_gravado_15: 200,
  total_gravado_18: 0,

  total_isv_15: 30,
  total_isv_18: 0,

  total: 230,

  total_letras: "DOSCIENTOS TREINTA LEMPIRAS CON 00/100",

  estado_factura: false,

  metodo_pago: "Efectivo",
};

const detalles = [
  {
    id_detalle_venta: 1,
    id_producto: 1,

    producto_nombre_factura: "Aceite vegetal 1 L",

    producto_codigo_factura: "ALI-001",

    producto_unidad_medida_factura: "Unidad",

    producto_tasa_impuesto_factura: 15,

    cantidad: 2,

    precio_unitario: 100,

    descuento: 0,

    subtotal: 200,

    monto_impuesto: 30,
  },
];

const doc = generarFacturaPdf(venta, detalles);

const salida = fs.createWriteStream("factura_prueba.pdf");

doc.pipe(salida);

doc.end();

salida.on("finish", () => {
  console.log("✅ Factura generada: factura_prueba.pdf");
});
