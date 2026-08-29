const movimientoInventarioService = require("../services/movimiento_inventario.service");

class MovimientoInventarioController {
  async listarMovimientos(req, res, next) {
    try {
      const { id_producto, id_usuario, tipo_movimiento } = req.query;

      const movimientos = await movimientoInventarioService.listar({
        id_producto,
        id_usuario,
        tipo_movimiento,
      });

      res.status(200).json(movimientos);
    } catch (err) {
      next(err);
    }
  }

  async obtenerMovimiento(req, res, next) {
    try {
      const movimiento = await movimientoInventarioService.obtenerPorId(
        req.params.id,
      );

      res.status(200).json(movimiento);
    } catch (err) {
      next(err);
    }
  }

  async listarPorProducto(req, res, next) {
    try {
      const movimientos = await movimientoInventarioService.listarPorProducto(
        req.params.id_producto,
      );

      res.status(200).json(movimientos);
    } catch (err) {
      next(err);
    }
  }

  async crearMovimiento(req, res, next) {
    try {
      const movimiento = await movimientoInventarioService.crear(req.body);

      res.status(201).json(movimiento);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new MovimientoInventarioController();
