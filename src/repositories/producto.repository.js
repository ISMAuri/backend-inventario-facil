const { Op } = require("sequelize");

const Producto = require("../models/producto.model");

class ProductoRepository {
  async findAll({ estado, id_categoria, busqueda } = {}) {
    const where = {};

    if (estado !== undefined) {
      where.estado = estado;
    }

    if (id_categoria !== undefined) {
      where.id_categoria = id_categoria;
    }

    if (busqueda) {
      where[Op.or] = [
        {
          nombre_producto: {
            [Op.like]: `%${busqueda}%`,
          },
        },
        {
          codigo_producto: {
            [Op.like]: `%${busqueda}%`,
          },
        },
      ];
    }

    return Producto.findAll({
      where,
      order: [["nombre_producto", "ASC"]],
    });
  }

  async findById(id) {
    return Producto.findByPk(id);
  }

  async findByCodigo(codigo_producto) {
    return Producto.findOne({
      where: { codigo_producto },
    });
  }

  async findByNombre(nombre_producto) {
    return Producto.findOne({
      where: { nombre_producto },
    });
  }

  async findByCodigoExcluyendoId(codigo_producto, id) {
    return Producto.findOne({
      where: {
        codigo_producto,
        id_producto: {
          [Op.ne]: id,
        },
      },
    });
  }

  async create(datos, transaction = null) {
    return Producto.create(datos, { transaction });
  }

  async update(producto, cambios, transaction = null) {
    return producto.update(cambios, { transaction });
  }

  async softDelete(producto, transaction = null) {
    return producto.update({ estado: false }, { transaction });
  }
}

module.exports = new ProductoRepository();
