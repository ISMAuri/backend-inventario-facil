const clienteRepository = require("../repositories/cliente.repository");

class ClienteService {
  async listar({ estado, busqueda } = {}) {
    return clienteRepository.findAll({ estado, busqueda });
  }

  async obtenerPorId(id) {
    const cliente = await clienteRepository.findById(id);

    if (!cliente) {
      const error = new Error("Cliente no encontrado");
      error.statusCode = 404;
      throw error;
    }

    return cliente;
  }

  async crear({ nombre_cliente, rtn, direccion, telefono, correo }) {
    // El RTN es opcional, así que solo validamos duplicados si viene.
    if (rtn) {
      const existente = await clienteRepository.findByRtn(rtn);

      if (existente) {
        const error = new Error("Ya existe un cliente con ese RTN");
        error.statusCode = 409;
        throw error;
      }
    }

    try {
      return await clienteRepository.create({
        nombre_cliente,
        rtn: rtn || null,
        direccion: direccion || null,
        telefono: telefono || null,
        correo: correo || null,
      });
    } catch (err) {
      throw this._traducirErrorSequelize(err);
    }
  }

  async actualizar(
    id,
    { nombre_cliente, rtn, direccion, telefono, correo, estado },
  ) {
    const cliente = await this.obtenerPorId(id);

    if (rtn !== undefined && rtn !== null && rtn !== "") {
      const duplicado = await clienteRepository.findByRtnExcluyendoId(rtn, id);

      if (duplicado) {
        const error = new Error("Ya existe otro cliente con ese RTN");
        error.statusCode = 409;
        throw error;
      }
    }

    const cambios = {};

    if (nombre_cliente !== undefined) {
      cambios.nombre_cliente = nombre_cliente;
    }

    if (rtn !== undefined) {
      cambios.rtn = rtn || null;
    }

    if (direccion !== undefined) {
      cambios.direccion = direccion || null;
    }

    if (telefono !== undefined) {
      cambios.telefono = telefono || null;
    }

    if (correo !== undefined) {
      cambios.correo = correo || null;
    }

    if (estado !== undefined) {
      cambios.estado = estado;
    }

    try {
      return await clienteRepository.update(cliente, cambios);
    } catch (err) {
      throw this._traducirErrorSequelize(err);
    }
  }

  async eliminar(id) {
    const cliente = await this.obtenerPorId(id);

    return clienteRepository.softDelete(cliente);
  }

  _traducirErrorSequelize(err) {
    if (
      err.name === "SequelizeValidationError" ||
      err.name === "SequelizeUniqueConstraintError"
    ) {
      const mensaje = err.errors?.[0]?.message || "Datos de cliente inválidos";

      const error = new Error(mensaje);
      error.statusCode = 400;

      return error;
    }

    return err;
  }
}

module.exports = new ClienteService();
