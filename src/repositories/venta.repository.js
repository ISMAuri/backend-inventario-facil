const { Op } = require("sequelize");

const Venta = require("../models/venta.model");

class VentaRepository {
  async findAll({
    id_cliente,
    id_usuario,
    id_autorizacion,
    fecha_inicio,
    fecha_fin,
  } = {}) {
    const where = {};

    if (id_cliente !== undefined) {
      where.id_cliente = id_cliente;
    }

    if (id_usuario !== undefined) {
      where.id_usuario = id_usuario;
    }

    if (id_autorizacion !== undefined) {
      where.id_autorizacion = id_autorizacion;
    }

    if (fecha_inicio && fecha_fin) {
      where.fecha_venta = {
        [Op.between]: [fecha_inicio, fecha_fin],
      };
    } else if (fecha_inicio) {
      where.fecha_venta = {
        [Op.gte]: fecha_inicio,
      };
    } else if (fecha_fin) {
      where.fecha_venta = {
        [Op.lte]: fecha_fin,
      };
    }

    return Venta.findAll({
      where,
      order: [["fecha_venta", "DESC"]],
    });
  }

  async findById(id) {
    return Venta.findByPk(id);
  }

  async findByNumeroFactura(numero_factura) {
    return Venta.findOne({
      where: { numero_factura },
    });
  }

  async findByCorrelativo(correlativo, id_autorizacion) {
    return Venta.findOne({
      where: {
        correlativo,
        id_autorizacion,
      },
    });
  }

  async create(datos, transaction = null) {
    return Venta.create(datos, {
      transaction,
    });
  }

  async update(venta, cambios, transaction = null) {
    return venta.update(cambios, {
      transaction,
    });
  }
}

module.exports = new VentaRepository();