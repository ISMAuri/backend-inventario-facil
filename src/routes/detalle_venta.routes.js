const { Router } = require("express");

const detalleVentaController = require("../controllers/detalle_venta.controller");

const { authenticate } = require("../middlewares/authenticate");

const router = Router();

router.get(
  "/venta/:id_venta",
  authenticate,
  detalleVentaController.listarPorVenta,
);

router.get(
  "/producto/:id_producto",
  authenticate,
  detalleVentaController.listarPorProducto,
);

router.get("/:id", authenticate, detalleVentaController.obtenerDetalle);

module.exports = router;
