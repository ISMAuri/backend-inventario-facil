const { Router } = require("express");
const { body } = require("express-validator");

const productoController = require("../controllers/producto.controller");

const handleValidationErrors = require("../middlewares/validate");

const { authenticate, authorize } = require("../middlewares/authenticate");

const router = Router();

router.get("/", authenticate, productoController.listarProductos);

router.get("/:id", authenticate, productoController.obtenerProducto);

router.post(
  "/",
  authenticate,
  authorize("admin"),
  [
    body("id_categoria")
      .notEmpty()
      .withMessage("La categoría es obligatoria")
      .isInt({ min: 1 })
      .withMessage("La categoría no es válida"),

    body("nombre_producto")
      .trim()
      .notEmpty()
      .withMessage("El nombre del producto es obligatorio")
      .isLength({ max: 100 })
      .withMessage("El nombre no puede superar los 100 caracteres"),

    body("descripcion")
      .optional({ checkFalsy: true })
      .trim()
      .isLength({ max: 255 }),

    body("codigo_producto")
      .optional({ checkFalsy: true })
      .trim()
      .isLength({ max: 50 }),

    body("precio_compra")
      .optional({ checkFalsy: true })
      .isFloat({ min: 0 })
      .withMessage("El precio de compra no puede ser negativo"),

    body("precio_venta")
      .notEmpty()
      .withMessage("El precio de venta es obligatorio")
      .isFloat({ min: 0 })
      .withMessage("El precio de venta no puede ser negativo"),

    body("stock_actual")
      .optional()
      .isInt({ min: 0 })
      .withMessage("El stock debe ser un número entero no negativo"),

    body("unidad_medida")
      .optional({ checkFalsy: true })
      .trim()
      .isLength({ max: 50 }),

    body("tasa_impuesto")
      .optional()
      .isFloat({ min: 0 })
      .withMessage("La tasa de impuesto no puede ser negativa"),
  ],
  handleValidationErrors,
  productoController.crearProducto,
);

router.put(
  "/:id",
  authenticate,
  authorize("admin"),
  [
    body("id_categoria").optional().isInt({ min: 1 }),

    body("nombre_producto")
      .optional()
      .trim()
      .notEmpty()
      .withMessage("El nombre del producto no puede quedar vacío")
      .isLength({ max: 100 }),

    body("descripcion")
      .optional({ checkFalsy: true })
      .trim()
      .isLength({ max: 255 }),

    body("codigo_producto")
      .optional({ checkFalsy: true })
      .trim()
      .isLength({ max: 50 }),

    body("precio_compra").optional().isFloat({ min: 0 }),

    body("precio_venta").optional().isFloat({ min: 0 }),

    body("stock_actual").optional().isInt({ min: 0 }),

    body("unidad_medida")
      .optional({ checkFalsy: true })
      .trim()
      .isLength({ max: 50 }),

    body("tasa_impuesto").optional().isFloat({ min: 0 }),

    body("estado")
      .optional()
      .isBoolean()
      .withMessage("estado debe ser true o false"),
  ],
  handleValidationErrors,
  productoController.actualizarProducto,
);

router.delete(
  "/:id",
  authenticate,
  authorize("admin"),
  productoController.eliminarProducto,
);

module.exports = router;
