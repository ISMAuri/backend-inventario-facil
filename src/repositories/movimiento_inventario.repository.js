const MovimientoInventario = require(
  "../models/movimiento_inventario.model"
);

class MovimientoInventarioRepository {
  async findAll({
    id_producto,
    id_usuario,
    tipo_movimiento,
  } = {}) {
    const where = {};

    if (id_producto !== undefined) {
      where.id_producto = id_producto;
    }

    if (id_usuario !== undefined) {
      where.id_usuario = id_usuario;
    }

    if (tipo_movimiento !== undefined) {
      where.tipo_movimiento = tipo_movimiento;
    }

    return MovimientoInventario.findAll({
      where,
      order: [["fecha_movimiento", "DESC"]],
    });
  }

  async findById(id) {
    return MovimientoInventario.findByPk(id);
  }

  async findByProducto(id_producto) {
    return MovimientoInventario.findAll({
      where: { id_producto },
      order: [["fecha_movimiento", "DESC"]],
    });
  }

  async create(datos, transaction = null) {
    return MovimientoInventario.create(datos, {
      transaction,
    });
  }
}

module.exports = new MovimientoInventarioRepository();