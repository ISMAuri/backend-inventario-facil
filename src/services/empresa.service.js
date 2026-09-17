const empresaRepository = require("../repositories/empresa.repository");

class EmpresaService {
  async listar() {
    return empresaRepository.findAll();
  }

  async obtenerPorId(id) {
    const empresa = await empresaRepository.findById(id);

    if (!empresa) {
      const error = new Error("Empresa no encontrada");
      error.statusCode = 404;
      throw error;
    }

    return empresa;
  }

  async crear(datos) {
    try {
      return await empresaRepository.create(datos);
    } catch (err) {
      throw this._traducirErrorSequelize(err);
    }
  }

  async actualizar(id, cambios) {
    const empresa = await this.obtenerPorId(id);

    try {
      return await empresaRepository.update(empresa, cambios);
    } catch (err) {
      throw this._traducirErrorSequelize(err);
    }
  }

  _traducirErrorSequelize(err) {
    if (
      err.name === "SequelizeValidationError" ||
      err.name === "SequelizeUniqueConstraintError"
    ) {
      const mensaje = err.errors?.[0]?.message || "Datos de empresa inválidos";

      const error = new Error(mensaje);
      error.statusCode = 400;

      return error;
    }

    return err;
  }
}

module.exports = new EmpresaService();
