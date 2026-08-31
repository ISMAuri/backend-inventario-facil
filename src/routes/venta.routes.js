const { Router } = require("express");
const { body } = require("express-validator");

const ventaController = require("../controllers/venta.controller");

const handleValidationErrors = require("../middlewares/validate");

const { authenticate } = require("../middlewares/authenticate");

const router = Router();

router.get("/", authenticate, ventaController.listarVentas);

router.get(
  "/numero/:numero_factura",
  authenticate,
  ventaController.obtenerPorNumeroFactura,
);

router.get("/:id", authenticate, ventaController.obtenerVenta);

router.post(
  "/",
  authenticate,
  [
    body("id_cliente")
      .optional({ nullable: true })
      .isInt({ min: 1 })
      .withMessage("El cliente no es válido"),

    body("id_usuario").isInt({ min: 1 }).withMessage("El usuario no es válido"),

    body("id_autorizacion")
      .isInt({ min: 1 })
      .withMessage("La autorización de factura no es válida"),

    body("detalles")
      .isArray({ min: 1 })
      .withMessage("La venta debe contener al menos un producto"),

    body("detalles.*.id_producto")
      .isInt({ min: 1 })
      .withMessage("El producto del detalle no es válido"),

    body("detalles.*.cantidad")
      .isInt({ min: 1 })
      .withMessage("La cantidad debe ser mayor que cero"),

    body("detalles.*.descuento")
      .optional()
      .isFloat({ min: 0 })
      .withMessage("El descuento no puede ser negativo"),

    body("metodo_pago")
      .optional({ checkFalsy: true })
      .trim()
      .isLength({ max: 50 }),

    body("orden_compra_exenta")
      .optional({ checkFalsy: true })
      .trim()
      .isLength({ max: 50 }),

    body("constancia_registro_exonerados")
      .optional({ checkFalsy: true })
      .trim()
      .isLength({ max: 50 }),

    body("registro_sag")
      .optional({ checkFalsy: true })
      .trim()
      .isLength({ max: 50 }),

    body("total_letras")
      .trim()
      .notEmpty()
      .withMessage("El total en letras es obligatorio")
      .isLength({ max: 500 }),
  ],
  handleValidationErrors,
  ventaController.emitirVenta,
);

router.patch(
  "/:id/pdf",
  authenticate,
  [
    body("ruta_pdf_factura")
      .trim()
      .notEmpty()
      .withMessage("La ruta del PDF es obligatoria")
      .isLength({ max: 500 }),
  ],
  handleValidationErrors,
  ventaController.actualizarRutaPdf,
);

module.exports = router;
