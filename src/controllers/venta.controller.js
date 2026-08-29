const ventaService = require("../services/venta.service");

class VentaController {
  async listarVentas(req, res, next) {
    try {
      const {
        id_cliente,
        id_usuario,
        id_autorizacion,
        fecha_inicio,
        fecha_fin,
      } = req.query;

      const ventas = await ventaService.listar({
        id_cliente,
        id_usuario,
        id_autorizacion,
        fecha_inicio,
        fecha_fin,
      });

      res.status(200).json(ventas);
    } catch (err) {
      next(err);
    }
  }

  async obtenerVenta(req, res, next) {
    try {
      const venta = await ventaService.obtenerPorId(req.params.id);

      res.status(200).json(venta);
    } catch (err) {
      next(err);
    }
  }

  async obtenerPorNumeroFactura(req, res, next) {
    try {
      const venta = await ventaService.obtenerPorNumeroFactura(
        req.params.numero_factura,
      );

      res.status(200).json(venta);
    } catch (err) {
      next(err);
    }
  }

  async emitirVenta(req, res, next) {
    try {
      const venta = await ventaService.emitir(req.body);

      res.status(201).json(venta);
    } catch (err) {
      next(err);
    }
  }

  async actualizarRutaPdf(req, res, next) {
    try {
      const { ruta_pdf_factura } = req.body;

      const venta = await ventaService.actualizarRutaPdf(
        req.params.id,
        ruta_pdf_factura,
      );

      res.status(200).json(venta);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new VentaController();
