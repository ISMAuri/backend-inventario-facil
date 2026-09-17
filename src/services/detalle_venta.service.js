const detalleVentaRepository = require("../repositories/detalle_venta.repository");

const ventaRepository = require("../repositories/venta.repository");

const productoRepository = require("../repositories/producto.repository");

class DetalleVentaService {
  async obtenerPorId(id) {
    const detalle = await detalleVentaRepository.findById(id);

    if (!detalle) {
      const error = new Error("Detalle de venta no encontrado");
      error.statusCode = 404;
      throw error;
    }

    return detalle;
  }

  async listarPorVenta(id_venta) {
    const venta = await ventaRepository.findById(id_venta);

    if (!venta) {
      const error = new Error("Venta no encontrada");
      error.statusCode = 404;
      throw error;
    }

    return detalleVentaRepository.findByVenta(id_venta);
  }

  async listarPorProducto(id_producto) {
    const producto = await productoRepository.findById(id_producto);

    if (!producto) {
      const error = new Error("Producto no encontrado");
      error.statusCode = 404;
      throw error;
    }

    return detalleVentaRepository.findByProducto(id_producto);
  }

  async crear(datos) {
    const venta = await ventaRepository.findById(datos.id_venta);

    if (!venta) {
      const error = new Error("Venta no encontrada");
      error.statusCode = 404;
      throw error;
    }

    const producto = await productoRepository.findById(datos.id_producto);

    if (!producto) {
      const error = new Error("Producto no encontrado");
      error.statusCode = 404;
      throw error;
    }

    try {
      return await detalleVentaRepository.create(datos);
    } catch (err) {
      throw this._traducirErrorSequelize(err);
    }
  }

  _traducirErrorSequelize(err) {
    if (
      err.name === "SequelizeValidationError" ||
      err.name === "SequelizeForeignKeyConstraintError"
    ) {
      const mensaje =
        err.errors?.[0]?.message || "Datos del detalle de venta inválidos";

      const error = new Error(mensaje);
      error.statusCode = 400;

      return error;
    }

    return err;
  }
}

module.exports = new DetalleVentaService();
