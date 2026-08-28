const { Op } = require("sequelize");

const Cliente = require("../models/cliente.model");

class ClienteRepository {
  async findAll({ estado, busqueda } = {}) {
    const where = {};

    if (estado !== undefined) {
      where.estado = estado;
    }

    if (busqueda) {
      where[Op.or] = [
        {
          nombre_cliente: {
            [Op.like]: `%${busqueda}%`,
          },
        },
        {
          rtn: {
            [Op.like]: `%${busqueda}%`,
          },
        },
        {
          telefono: {
            [Op.like]: `%${busqueda}%`,
          },
        },
      ];
    }

    return Cliente.findAll({
      where,
      order: [["nombre_cliente", "ASC"]],
    });
  }

  async findById(id) {
    return Cliente.findByPk(id);
  }

  async findByRtn(rtn) {
    return Cliente.findOne({
      where: { rtn },
    });
  }

  async findByRtnExcluyendoId(rtn, id) {
    return Cliente.findOne({
      where: {
        rtn,
        id_cliente: {
          [Op.ne]: id,
        },
      },
    });
  }

  async create(datos, transaction = null) {
    return Cliente.create(datos, { transaction });
  }

  async update(cliente, cambios, transaction = null) {
    return cliente.update(cambios, { transaction });
  }

  async softDelete(cliente, transaction = null) {
    return cliente.update({ estado: false }, { transaction });
  }
}

module.exports = new ClienteRepository();
