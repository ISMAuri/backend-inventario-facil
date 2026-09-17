const { Router } = require("express");
const { body } = require("express-validator");

const movimientoInventarioController = require("../controllers/movimiento_inventario.controller");

const handleValidationErrors = require("../middlewares/validate");

const { authenticate, authorize } = require("../middlewares/authenticate");

const router = Router();

router.get("/", authenticate, movimientoInventarioController.listarMovimientos);

router.get(
  "/producto/:id_producto",
  authenticate,
  movimientoInventarioController.listarPorProducto,
);

router.get(
  "/:id",
  authenticate,
  movimientoInventarioController.obtenerMovimiento,
);

router.post(
  "/",
  authenticate,
  authorize("admin"),
  [
    body("id_producto")
      .isInt({ min: 1 })
      .withMessage("El producto no es válido"),

    body("id_usuario").isInt({ min: 1 }).withMessage("El usuario no es válido"),

    body("tipo_movimiento")
      .isIn(["entrada", "salida"])
      .withMessage("El tipo de movimiento debe ser entrada o salida"),

    body("cantidad")
      .isInt({ min: 1 })
      .withMessage("La cantidad debe ser un entero mayor que cero"),

    body("motivo")
      .optional({ checkFalsy: true })
      .trim()
      .isLength({ max: 100 })
      .withMessage("El motivo no puede superar los 100 caracteres"),
  ],
  handleValidationErrors,
  movimientoInventarioController.crearMovimiento,
);

module.exports = router;
