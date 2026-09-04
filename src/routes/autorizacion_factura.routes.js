const { Router } = require("express");
const { body } = require("express-validator");

const autorizacionFacturaController = require("../controllers/autorizacion_factura.controller");

const handleValidationErrors = require("../middlewares/validate");

const { authenticate, authorize } = require("../middlewares/authenticate");

const router = Router();

router.get(
  "/",
  authenticate,
  autorizacionFacturaController.listarAutorizaciones,
);

router.get(
  "/empresa/:id_empresa/activa",
  authenticate,
  autorizacionFacturaController.obtenerActivaPorEmpresa,
);

router.get(
  "/:id",
  authenticate,
  autorizacionFacturaController.obtenerAutorizacion,
);

router.post(
  "/",
  authenticate,
  authorize("admin"),
  [
    body("id_empresa").isInt({ min: 1 }).withMessage("La empresa no es válida"),

    body("cai")
      .trim()
      .notEmpty()
      .withMessage("El CAI es obligatorio")
      .isLength({ max: 50 }),

    body("establecimiento")
      .trim()
      .notEmpty()
      .withMessage("El establecimiento es obligatorio")
      .isLength({ min: 3, max: 3 })
      .withMessage("El establecimiento debe tener 3 caracteres"),

    body("punto_emision")
      .trim()
      .notEmpty()
      .withMessage("El punto de emisión es obligatorio")
      .isLength({ min: 3, max: 3 }),

    body("tipo_documento").optional().trim().isLength({ min: 2, max: 2 }),

    body("rango_inicial")
      .isInt({ min: 1 })
      .withMessage("El rango inicial no es válido"),

    body("rango_final")
      .isInt({ min: 1 })
      .withMessage("El rango final no es válido"),

    body("siguiente_correlativo").optional().isInt({ min: 1 }),

    body("fecha_autorizacion")
      .isISO8601()
      .withMessage("La fecha de autorización no es válida"),

    body("fecha_limite_emision")
      .isISO8601()
      .withMessage("La fecha límite de emisión no es válida"),
  ],
  handleValidationErrors,
  autorizacionFacturaController.crearAutorizacion,
);

router.put(
  "/:id",
  authenticate,
  authorize("admin"),
  [
    body("id_empresa").optional().isInt({ min: 1 }),

    body("cai").optional().trim().notEmpty().isLength({ max: 50 }),

    body("establecimiento").optional().trim().isLength({ min: 3, max: 3 }),

    body("punto_emision").optional().trim().isLength({ min: 3, max: 3 }),

    body("tipo_documento").optional().trim().isLength({ min: 2, max: 2 }),

    body("rango_inicial").optional().isInt({ min: 1 }),

    body("rango_final").optional().isInt({ min: 1 }),

    body("siguiente_correlativo").optional().isInt({ min: 1 }),

    body("fecha_autorizacion").optional().isISO8601(),

    body("fecha_limite_emision").optional().isISO8601(),
  ],
  handleValidationErrors,
  autorizacionFacturaController.actualizarAutorizacion,
);

router.delete(
  "/:id",
  authenticate,
  authorize("admin"),
  autorizacionFacturaController.eliminarAutorizacion,
);

module.exports = router;
