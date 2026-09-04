const AutorizacionFactura = require("../models/autorizacion_factura.model");

class AutorizacionFacturaRepository {
  async findAll({ estado, id_empresa } = {}) {
    const where = {};

    if (estado !== undefined) {
      where.estado = estado;
    }

    if (id_empresa !== undefined) {
      where.id_empresa = id_empresa;
    }

    return AutorizacionFactura.findAll({
      where,
      order: [["fecha_autorizacion", "DESC"]],
    });
  }

  async findById(id) {
    return AutorizacionFactura.findByPk(id);
  }

  async findActivaByEmpresa(id_empresa, transaction = null) {
    return AutorizacionFactura.findOne({
      where: {
        id_empresa,
        estado: true,
      },
      order: [["fecha_autorizacion", "DESC"]],
      transaction,
    });
  }
  async desactivarActivas(id_empresa, transaction = null) {
    return AutorizacionFactura.update(
      {
        estado: false,
      },
      {
        where: {
          id_empresa,
          estado: true,
        },
        transaction,
      },
    );
  }
  async create(datos, transaction = null) {
    return AutorizacionFactura.create(datos, {
      transaction,
    });
  }

  async update(autorizacion, cambios, transaction = null) {
    return autorizacion.update(cambios, {
      transaction,
    });
  }

  async softDelete(autorizacion, transaction = null) {
    return autorizacion.update({ estado: false }, { transaction });
  }
}

module.exports = new AutorizacionFacturaRepository();
