const { Router } = require("express");
const { body } = require("express-validator");

const clienteController = require("../controllers/cliente.controller");

const handleValidationErrors = require("../middlewares/validate");
const { authenticate } = require("../middlewares/authenticate");

const router = Router();

router.get("/", authenticate, clienteController.listarClientes);

router.get("/:id", authenticate, clienteController.obtenerCliente);

router.post(
  "/",
  authenticate,
  [
    body("nombre_cliente")
      .trim()
      .notEmpty()
      .withMessage("El nombre del cliente es obligatorio")
      .isLength({ max: 100 })
      .withMessage("El nombre del cliente no puede superar los 100 caracteres"),

    body("rtn")
      .optional({ checkFalsy: true })
      .trim()
      .isLength({ max: 14 })
      .withMessage("El RTN no puede superar los 14 caracteres"),

    body("direccion")
      .optional({ checkFalsy: true })
      .trim()
      .isLength({ max: 200 })
      .withMessage("La dirección no puede superar los 200 caracteres"),

    body("telefono")
      .optional({ checkFalsy: true })
      .trim()
      .isLength({ max: 20 })
      .withMessage("El teléfono no puede superar los 20 caracteres"),

    body("correo")
      .optional({ checkFalsy: true })
      .trim()
      .isEmail()
      .withMessage("El correo no tiene un formato válido")
      .isLength({ max: 100 })
      .withMessage("El correo no puede superar los 100 caracteres"),
  ],
  handleValidationErrors,
  clienteController.crearCliente,
);

router.put(
  "/:id",
  authenticate,
  [
    body("nombre_cliente")
      .optional()
      .trim()
      .notEmpty()
      .withMessage("El nombre del cliente no puede quedar vacío")
      .isLength({ max: 100 }),

    body("rtn").optional({ checkFalsy: true }).trim().isLength({ max: 14 }),

    body("direccion")
      .optional({ checkFalsy: true })
      .trim()
      .isLength({ max: 200 }),

    body("telefono")
      .optional({ checkFalsy: true })
      .trim()
      .isLength({ max: 20 }),

    body("correo")
      .optional({ checkFalsy: true })
      .trim()
      .isEmail()
      .withMessage("El correo no tiene un formato válido"),

    body("estado")
      .optional()
      .isBoolean()
      .withMessage("estado debe ser true o false"),
  ],
  handleValidationErrors,
  clienteController.actualizarCliente,
);

router.delete("/:id", authenticate, clienteController.eliminarCliente);

module.exports = router;
