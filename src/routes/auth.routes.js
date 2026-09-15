const { Router } = require("express");
const { body } = require("express-validator");

const authController = require("../controllers/auth.controller");

const handleValidationErrors = require("../middlewares/validate");

const { authenticate } = require("../middlewares/authenticate");

const router = Router();

router.post(
  "/register",
  [
    body("fullName")
      .trim()
      .notEmpty()
      .withMessage("El nombre completo es obligatorio")
      .isLength({
        min: 3,
        max: 150,
      })
      .withMessage("El nombre debe tener entre 3 y 150 caracteres"),

    body("email")
      .trim()
      .isEmail()
      .withMessage("Debe ser un correo válido")
      .normalizeEmail(),

    body("password")
      .isLength({
        min: 8,
      })
      .withMessage("La contraseña debe tener al menos 8 caracteres")
      .matches(/\d/)
      .withMessage("La contraseña debe incluir al menos un número"),

    body("role").isIn(["client", "provider"]).withMessage("Rol inválido"),
  ],

  handleValidationErrors,
  authController.register,
);

router.post(
  "/login",
  [
    body("email")
      .trim()
      .isEmail()
      .withMessage("Debe ser un correo válido")
      .normalizeEmail(),

    body("password").notEmpty().withMessage("La contraseña es obligatoria"),
  ],

  handleValidationErrors,
  authController.login,
);

router.post("/refresh", authController.refresh);

router.post("/logout", authController.logout);

router.get("/me", authenticate, authController.obtenerPerfil);

router.put(
  "/me",
  authenticate,

  [
    body("fullName")
      .trim()
      .notEmpty()
      .withMessage("El nombre completo es obligatorio")
      .isLength({
        min: 3,
        max: 150,
      })
      .withMessage("El nombre debe tener entre 3 y 150 caracteres"),

    body("email")
      .trim()
      .isEmail()
      .withMessage("Debe ser un correo válido")
      .normalizeEmail(),
  ],

  handleValidationErrors,
  authController.actualizarPerfil,
);

router.put(
  "/me/password",
  authenticate,

  [
    body("passwordNueva")
      .notEmpty()
      .withMessage("La nueva contraseña es obligatoria")
      .isLength({
        min: 8,
      })
      .withMessage("La contraseña debe tener al menos 8 caracteres")
      .matches(/\d/)
      .withMessage("La contraseña debe incluir al menos un número"),
  ],

  handleValidationErrors,
  authController.cambiarPassword,
);

router.get("/:id", authenticate, authController.obtenerUsuario);

module.exports = router;
