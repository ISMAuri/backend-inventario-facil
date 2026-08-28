const DetalleVenta = require(
  "../models/detalle_venta.model"
);

class DetalleVentaRepository {
  async findById(id) {
    return DetalleVenta.findByPk(id);
  }

  async findByVenta(id_venta) {
    return DetalleVenta.findAll({
      where: { id_venta },
      order: [["id_detalle_venta", "ASC"]],
    });
  }

  async findByProducto(id_producto) {
    return DetalleVenta.findAll({
      where: { id_producto },
      order: [["id_detalle_venta", "DESC"]],
    });
  }

  async create(datos, transaction = null) {
    return DetalleVenta.create(datos, {
      transaction,
    });
  }

  async bulkCreate(detalles, transaction = null) {
    return DetalleVenta.bulkCreate(detalles, {
      transaction,
    });
  }
}

module.exports = new DetalleVentaRepository();