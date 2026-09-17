const passwordResetService = require("../services/password_reset.service");

class PasswordResetController {
  async solicitarOtp(req, res, next) {
    try {
      const { email } = req.body;

      const resultado = await passwordResetService.solicitarOtp(email);

      res.status(200).json(resultado);
    } catch (error) {
      next(error);
    }
  }

  async verificarOtp(req, res, next) {
    try {
      const { recoveryId, otp } = req.body;

      const resultado = await passwordResetService.verificarOtp({
        recoveryId,
        otp,
      });

      res.status(200).json(resultado);
    } catch (error) {
      next(error);
    }
  }

  async restablecerPassword(req, res, next) {
    try {
      const { recoveryId, passwordNueva } = req.body;

      const resultado = await passwordResetService.restablecerPassword({
        recoveryId,
        passwordNueva,
      });

      res.status(200).json(resultado);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new PasswordResetController();
