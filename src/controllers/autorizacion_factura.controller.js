const autorizacionFacturaService = require("../services/autorizacion_factura.service");

class AutorizacionFacturaController {
  async listarAutorizaciones(req, res, next) {
    try {
      const { estado, id_empresa } = req.query;

      const filtros = {};

      if (estado !== undefined) {
        filtros.estado = estado === "true";
      }

      if (id_empresa !== undefined) {
        filtros.id_empresa = id_empresa;
      }

      const autorizaciones = await autorizacionFacturaService.listar(filtros);

      res.status(200).json(autorizaciones);
    } catch (err) {
      next(err);
    }
  }

  async obtenerAutorizacion(req, res, next) {
    try {
      const autorizacion = await autorizacionFacturaService.obtenerPorId(
        req.params.id,
      );

      res.status(200).json(autorizacion);
    } catch (err) {
      next(err);
    }
  }

  async obtenerActivaPorEmpresa(req, res, next) {
  try {
    const autorizacion =
      await autorizacionFacturaService.obtenerActivaPorEmpresa(
        req.params.id_empresa,
      );

    res.status(200).json(autorizacion);
  } catch (err) {
    next(err);
  }
}

  async crearAutorizacion(req, res, next) {
    try {
      const autorizacion = await autorizacionFacturaService.crear(req.body);

      res.status(201).json(autorizacion);
    } catch (err) {
      next(err);
    }
  }

  async actualizarAutorizacion(req, res, next) {
    try {
      const autorizacion = await autorizacionFacturaService.actualizar(
        req.params.id,
        req.body,
      );

      res.status(200).json(autorizacion);
    } catch (err) {
      next(err);
    }
  }

  async eliminarAutorizacion(req, res, next) {
    try {
      const autorizacion = await autorizacionFacturaService.eliminar(
        req.params.id,
      );

      res.status(200).json({
        message: "Autorización desactivada correctamente",
        autorizacion,
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new AutorizacionFacturaController();
