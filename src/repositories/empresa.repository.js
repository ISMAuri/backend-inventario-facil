const Empresa = require("../models/empresa.model");

class EmpresaRepository {
  async findAll() {
    return Empresa.findAll({
      order: [["nombre_empresa", "ASC"]],
    });
  }

  async findById(id) {
    return Empresa.findByPk(id);
  }

  async create(datos, transaction = null) {
    return Empresa.create(datos, { transaction });
  }

  async update(empresa, cambios, transaction = null) {
    return empresa.update(cambios, { transaction });
  }
}

module.exports = new EmpresaRepository();