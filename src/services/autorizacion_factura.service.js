const sequelize = require("../config/database");
const autorizacionRepository = require("../repositories/autorizacion_factura.repository");
const empresaRepository = require("../repositories/empresa.repository");

class AutorizacionFacturaService {
  async listar({ estado, id_empresa } = {}) {
    return autorizacionRepository.findAll({
      estado,
      id_empresa,
    });
  }

  async obtenerPorId(id) {
    const autorizacion = await autorizacionRepository.findById(id);

    if (!autorizacion) {
      const error = new Error("Autorización de factura no encontrada");
      error.statusCode = 404;
      throw error;
    }

    return autorizacion;
  }

  async obtenerActivaPorEmpresa(id_empresa) {
    await this._validarEmpresa(id_empresa);

    return autorizacionRepository.findActivaByEmpresa(id_empresa);
  }

  async crear(datos) {
    await this._validarEmpresa(datos.id_empresa);

    this._validarRangos(datos);

    const transaction = await sequelize.transaction();

    try {
      // Desactiva cualquier autorización activa anterior.
      await autorizacionRepository.desactivarActivas(
        datos.id_empresa,
        transaction,
      );

      // La nueva autorización siempre queda activa.
      const nuevaAutorizacion = await autorizacionRepository.create(
        {
          ...datos,
          estado: true,
        },
        transaction,
      );

      await transaction.commit();

      return nuevaAutorizacion;
    } catch (err) {
      await transaction.rollback();

      throw this._traducirErrorSequelize(err);
    }
  }

  async actualizar(id, cambios) {
    const autorizacion = await this.obtenerPorId(id);

    const { estado, ...cambiosPermitidos } = cambios;

    if (cambiosPermitidos.id_empresa !== undefined) {
      await this._validarEmpresa(cambiosPermitidos.id_empresa);
    }

    const datosFinales = {
      rango_inicial:
        cambiosPermitidos.rango_inicial ?? autorizacion.rango_inicial,

      rango_final: cambiosPermitidos.rango_final ?? autorizacion.rango_final,

      siguiente_correlativo:
        cambiosPermitidos.siguiente_correlativo ??
        autorizacion.siguiente_correlativo,

      fecha_autorizacion:
        cambiosPermitidos.fecha_autorizacion ?? autorizacion.fecha_autorizacion,

      fecha_limite_emision:
        cambiosPermitidos.fecha_limite_emision ??
        autorizacion.fecha_limite_emision,
    };

    this._validarRangos(datosFinales);

    try {
      return await autorizacionRepository.update(
        autorizacion,
        cambiosPermitidos,
      );
    } catch (err) {
      throw this._traducirErrorSequelize(err);
    }
  }

  async eliminar(id) {
    const autorizacion = await this.obtenerPorId(id);

    return autorizacionRepository.softDelete(autorizacion);
  }

  async _validarEmpresa(id_empresa) {
    const empresa = await empresaRepository.findById(id_empresa);

    if (!empresa) {
      const error = new Error("Empresa no encontrada");
      error.statusCode = 404;
      throw error;
    }
  }

  _validarRangos({
    rango_inicial,
    rango_final,
    siguiente_correlativo,
    fecha_autorizacion,
    fecha_limite_emision,
  }) {
    if (Number(rango_inicial) > Number(rango_final)) {
      const error = new Error(
        "El rango inicial no puede ser mayor que el rango final",
      );
      error.statusCode = 400;
      throw error;
    }

    if (
      Number(siguiente_correlativo) < Number(rango_inicial) ||
      Number(siguiente_correlativo) > Number(rango_final)
    ) {
      const error = new Error(
        "El siguiente correlativo debe estar dentro del rango autorizado",
      );
      error.statusCode = 400;
      throw error;
    }

    if (new Date(fecha_autorizacion) > new Date(fecha_limite_emision)) {
      const error = new Error(
        "La fecha límite debe ser posterior a la fecha de autorización",
      );
      error.statusCode = 400;
      throw error;
    }
  }

  _traducirErrorSequelize(err) {
    if (
      err.name === "SequelizeValidationError" ||
      err.name === "SequelizeUniqueConstraintError" ||
      err.name === "SequelizeForeignKeyConstraintError"
    ) {
      const mensaje =
        err.errors?.[0]?.message || "Datos de autorización inválidos";

      const error = new Error(mensaje);
      error.statusCode = 400;

      return error;
    }

    return err;
  }
}

module.exports = new AutorizacionFacturaService();
