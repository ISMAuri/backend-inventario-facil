const sequelize = require("../config/database");
const ventaRepository = require("../repositories/venta.repository");
const detalleVentaRepository = require("../repositories/detalle_venta.repository");
const productoRepository = require("../repositories/producto.repository");
const clienteRepository = require("../repositories/cliente.repository");
const autorizacionRepository = require("../repositories/autorizacion_factura.repository");
const empresaRepository = require("../repositories/empresa.repository");
const movimientoRepository = require("../repositories/movimiento_inventario.repository");
const userRepository = require("../repositories/user.repository");

class VentaService {
  async listar(filtros = {}) {
    return ventaRepository.findAll(filtros);
  }

  async obtenerPorId(id) {
    const venta = await ventaRepository.findById(id);

    if (!venta) {
      const error = new Error("Venta no encontrada");
      error.statusCode = 404;
      throw error;
    }

    return venta;
  }

  async obtenerPorNumeroFactura(numero_factura) {
    const venta = await ventaRepository.findByNumeroFactura(numero_factura);

    if (!venta) {
      const error = new Error("Venta no encontrada");
      error.statusCode = 404;
      throw error;
    }

    return venta;
  }

  async emitir({
    id_cliente,
    id_usuario,
    id_autorizacion,
    detalles,
    metodo_pago,
    orden_compra_exenta,
    constancia_registro_exonerados,
    registro_sag,
    total_letras,
  }) {
    if (!Array.isArray(detalles) || detalles.length === 0) {
      const error = new Error("La venta debe contener al menos un producto");
      error.statusCode = 400;
      throw error;
    }

    const usuario = await userRepository.findById(id_usuario);

    if (!usuario) {
      const error = new Error("Usuario no encontrado");
      error.statusCode = 404;
      throw error;
    }

    let cliente = null;

    if (id_cliente !== null && id_cliente !== undefined) {
      cliente = await clienteRepository.findById(id_cliente);

      if (!cliente) {
        const error = new Error("Cliente no encontrado");
        error.statusCode = 404;
        throw error;
      }
    }

    const autorizacion = await autorizacionRepository.findById(id_autorizacion);

    if (!autorizacion) {
      const error = new Error("Autorización de factura no encontrada");
      error.statusCode = 404;
      throw error;
    }

    if (!autorizacion.estado) {
      const error = new Error("La autorización de factura está inactiva");
      error.statusCode = 400;
      throw error;
    }

    const hoy = new Date();
    const fechaLimite = new Date(autorizacion.fecha_limite_emision);

    if (hoy > fechaLimite) {
      const error = new Error("La autorización de factura ha vencido");
      error.statusCode = 400;
      throw error;
    }

    const correlativo = Number(autorizacion.siguiente_correlativo);

    if (correlativo > Number(autorizacion.rango_final)) {
      const error = new Error("Se agotó el rango autorizado de facturación");
      error.statusCode = 400;
      throw error;
    }

    const empresa = await empresaRepository.findById(autorizacion.id_empresa);

    if (!empresa) {
      const error = new Error(
        "Empresa asociada a la autorización no encontrada",
      );
      error.statusCode = 404;
      throw error;
    }

    const numeroFactura = this._formatearNumeroFactura(
      autorizacion.establecimiento,
      autorizacion.punto_emision,
      autorizacion.tipo_documento,
      correlativo,
    );

    const facturaExistente =
      await ventaRepository.findByNumeroFactura(numeroFactura);

    if (facturaExistente) {
      const error = new Error("El número de factura ya existe");
      error.statusCode = 409;
      throw error;
    }

    return sequelize.transaction(async (transaction) => {
      let subtotal = 0;
      let totalDescuentos = 0;
      let totalTasaCero = 0;
      let totalGravado15 = 0;
      let totalGravado18 = 0;
      let totalIsv15 = 0;
      let totalIsv18 = 0;

      const detallesPreparados = [];

      for (const detalle of detalles) {
        const producto = await productoRepository.findById(detalle.id_producto);

        if (!producto) {
          const error = new Error(
            `Producto ${detalle.id_producto} no encontrado`,
          );
          error.statusCode = 404;
          throw error;
        }

        if (!producto.estado) {
          const error = new Error(
            `El producto ${producto.nombre_producto} está inactivo`,
          );
          error.statusCode = 400;
          throw error;
        }

        const cantidad = Number(detalle.cantidad);

        if (!Number.isInteger(cantidad) || cantidad <= 0) {
          const error = new Error(
            "La cantidad debe ser un entero mayor que cero",
          );
          error.statusCode = 400;
          throw error;
        }

        if (cantidad > Number(producto.stock_actual)) {
          const error = new Error(
            `Stock insuficiente para ${producto.nombre_producto}`,
          );
          error.statusCode = 409;
          throw error;
        }

        const precioUnitario = Number(producto.precio_venta);

        const descuento = Number(detalle.descuento || 0);

        const bruto = precioUnitario * cantidad;

        if (descuento < 0 || descuento > bruto) {
          const error = new Error(
            `Descuento inválido para ${producto.nombre_producto}`,
          );
          error.statusCode = 400;
          throw error;
        }

        const subtotalLinea = bruto - descuento;
        const tasa = Number(producto.tasa_impuesto);

        if (![0, 15, 18].includes(tasa)) {
          const error = new Error(
            `Tasa de impuesto no soportada para ${producto.nombre_producto}`,
          );
          error.statusCode = 400;
          throw error;
        }

        const montoImpuesto = subtotalLinea * (tasa / 100);

        subtotal += subtotalLinea;
        totalDescuentos += descuento;

        if (tasa === 0) {
          totalTasaCero += subtotalLinea;
        }

        if (tasa === 15) {
          totalGravado15 += subtotalLinea;
          totalIsv15 += montoImpuesto;
        }

        if (tasa === 18) {
          totalGravado18 += subtotalLinea;
          totalIsv18 += montoImpuesto;
        }

        detallesPreparados.push({
          producto,
          cantidad,
          precioUnitario,
          descuento,
          subtotalLinea,
          tasa,
          montoImpuesto,
        });
      }

      const total = subtotal + totalIsv15 + totalIsv18;

      const venta = await ventaRepository.create(
        {
          id_cliente: id_cliente || null,
          id_usuario,
          usuario_nombre_factura: usuario.fullName,

          id_autorizacion,

          numero_factura: numeroFactura,
          correlativo,

          cai_factura: autorizacion.cai,

          rango_inicial_factura: this._formatearNumeroFactura(
            autorizacion.establecimiento,
            autorizacion.punto_emision,
            autorizacion.tipo_documento,
            autorizacion.rango_inicial,
          ),

          rango_final_factura: this._formatearNumeroFactura(
            autorizacion.establecimiento,
            autorizacion.punto_emision,
            autorizacion.tipo_documento,
            autorizacion.rango_final,
          ),

          fecha_limite_emision_factura: autorizacion.fecha_limite_emision,

          empresa_nombre_factura: empresa.nombre_empresa,

          empresa_razon_social_factura: empresa.razon_social,

          empresa_rtn_factura: empresa.rtn,

          empresa_direccion_factura: empresa.direccion,

          empresa_telefono_factura: empresa.telefono,

          empresa_correo_factura: empresa.correo,

          empresa_logo_factura: empresa.logo,

          cliente_nombre_factura: cliente?.nombre_cliente ?? "Consumidor Final",

          cliente_rtn_factura: cliente?.rtn ?? null,

          cliente_direccion_factura: cliente?.direccion ?? null,

          cliente_telefono_factura: cliente?.telefono ?? null,

          cliente_correo_factura: cliente?.correo ?? null,

          orden_compra_exenta,
          constancia_registro_exonerados,
          registro_sag,

          metodo_pago,

          subtotal,
          total_descuentos: totalDescuentos,

          total_exento: 0,
          total_exonerado: 0,
          total_tasa_cero: totalTasaCero,

          total_gravado_15: totalGravado15,
          total_gravado_18: totalGravado18,

          total_isv_15: totalIsv15,
          total_isv_18: totalIsv18,

          total,

          total_letras,
        },
        transaction,
      );

      const detallesParaGuardar = [];

      for (const item of detallesPreparados) {
        const producto = item.producto;

        detallesParaGuardar.push({
          id_venta: venta.id_venta,

          id_producto: producto.id_producto,

          producto_codigo_factura: producto.codigo_producto,

          producto_nombre_factura: producto.nombre_producto,

          producto_descripcion_factura: producto.descripcion,

          producto_unidad_medida_factura: producto.unidad_medida,

          producto_tasa_impuesto_factura: item.tasa,

          cantidad: item.cantidad,

          precio_unitario: item.precioUnitario,

          descuento: item.descuento,

          subtotal: item.subtotalLinea,

          base_gravada: item.tasa > 0 ? item.subtotalLinea : 0,

          base_exenta: 0,

          base_exonerada: 0,

          base_tasa_cero: item.tasa === 0 ? item.subtotalLinea : 0,

          monto_impuesto: item.montoImpuesto,
        });

        await productoRepository.update(
          producto,
          {
            stock_actual: Number(producto.stock_actual) - item.cantidad,
          },
          transaction,
        );

        await movimientoRepository.create(
          {
            id_producto: producto.id_producto,
            id_usuario,
            tipo_movimiento: "salida",
            cantidad: item.cantidad,
            motivo: `Venta ${numeroFactura}`,
          },
          transaction,
        );
      }

      await detalleVentaRepository.bulkCreate(detallesParaGuardar, transaction);

      await autorizacionRepository.update(
        autorizacion,
        {
          siguiente_correlativo: correlativo + 1,
        },
        transaction,
      );

      return venta;
    });
  }

  async actualizarRutaPdf(id, ruta_pdf_factura) {
    const venta = await this.obtenerPorId(id);

    return ventaRepository.update(venta, {
      ruta_pdf_factura,
    });
  }

  _formatearNumeroFactura(
    establecimiento,
    puntoEmision,
    tipoDocumento,
    correlativo,
  ) {
    return `${establecimiento}-${puntoEmision}-${tipoDocumento}-${String(
      correlativo,
    ).padStart(8, "0")}`;
  }
}

module.exports = new VentaService();
