const { Router } = require("express");
const { body } = require("express-validator");

const empresaController = require("../controllers/empresa.controller");

const handleValidationErrors = require("../middlewares/validate");

const { authenticate, authorize } = require("../middlewares/authenticate");

const router = Router();

router.get("/", authenticate, empresaController.listarEmpresas);

router.get("/:id", authenticate, empresaController.obtenerEmpresa);

router.post(
  "/",
  authenticate,
  authorize("admin"),
  [
    body("nombre_empresa")
      .trim()
      .notEmpty()
      .withMessage("El nombre de la empresa es obligatorio")
      .isLength({ max: 100 }),

    body("razon_social")
      .optional({ checkFalsy: true })
      .trim()
      .isLength({ max: 100 }),

    body("rtn").optional({ checkFalsy: true }).trim().isLength({ max: 20 }),

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

    body("logo").optional({ checkFalsy: true }).trim().isLength({ max: 255 }),
  ],
  handleValidationErrors,
  empresaController.crearEmpresa,
);

router.put(
  "/:id",
  authenticate,
  authorize("admin"),
  [
    body("nombre_empresa")
      .optional()
      .trim()
      .notEmpty()
      .withMessage("El nombre de la empresa no puede quedar vacío")
      .isLength({ max: 100 }),

    body("razon_social")
      .optional({ checkFalsy: true })
      .trim()
      .isLength({ max: 100 }),

    body("rtn").optional({ checkFalsy: true }).trim().isLength({ max: 20 }),

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

    body("logo").optional({ checkFalsy: true }).trim().isLength({ max: 255 }),
  ],
  handleValidationErrors,
  empresaController.actualizarEmpresa,
);

module.exports = router;
