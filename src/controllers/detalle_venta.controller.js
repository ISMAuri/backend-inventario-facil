const detalleVentaService = require("../services/detalle_venta.service");

class DetalleVentaController {
  async obtenerDetalle(req, res, next) {
    try {
      const detalle = await detalleVentaService.obtenerPorId(req.params.id);

      res.status(200).json(detalle);
    } catch (err) {
      next(err);
    }
  }

  async listarPorVenta(req, res, next) {
    try {
      const detalles = await detalleVentaService.listarPorVenta(
        req.params.id_venta,
      );

      res.status(200).json(detalles);
    } catch (err) {
      next(err);
    }
  }

  async listarPorProducto(req, res, next) {
    try {
      const detalles = await detalleVentaService.listarPorProducto(
        req.params.id_producto,
      );

      res.status(200).json(detalles);
    } catch (err) {
      next(err);
    }
  }

  async crearDetalle(req, res, next) {
    try {
      const detalle = await detalleVentaService.crear(req.body);

      res.status(201).json(detalle);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new DetalleVentaController();
