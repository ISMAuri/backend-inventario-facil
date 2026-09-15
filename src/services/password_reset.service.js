const crypto = require("crypto");

const userRepository = require("../repositories/user.repository");

const passwordResetRepository = require("../repositories/password_reset.repository");

const emailService = require("./email.service");

const { hashPassword } = require("../utils/password");

const OTP_MINUTOS = 10;
const MAX_INTENTOS = 5;

function generarRecoveryId() {
  return crypto.randomBytes(32).toString("hex");
}

function generarOtp() {
  return crypto.randomInt(0, 1000000).toString().padStart(6, "0");
}

function hashRecoveryId(recoveryId) {
  return crypto.createHash("sha256").update(recoveryId).digest("hex");
}

function hashOtp(recoveryId, otp) {
  const secret = process.env.OTP_SECRET;

  if (!secret) {
    const error = new Error("OTP_SECRET no está configurado");
    error.statusCode = 500;
    throw error;
  }

  return crypto
    .createHmac("sha256", secret)
    .update(`${recoveryId}:${otp}`)
    .digest("hex");
}

function compararHashes(a, b) {
  const bufferA = Buffer.from(a, "hex");
  const bufferB = Buffer.from(b, "hex");

  if (bufferA.length !== bufferB.length) {
    return false;
  }

  return crypto.timingSafeEqual(bufferA, bufferB);
}

function errorCodigo() {
  const error = new Error("Código inválido o expirado");

  error.statusCode = 400;

  return error;
}

class PasswordResetService {
  async solicitarOtp(email) {
    const recoveryId = generarRecoveryId();

    const usuario = await userRepository.findByEmail(email);

    // Evita revelar si un correo está registrado.
    if (!usuario) {
      return {
        message:
          "Si el correo está registrado, recibirás un código de verificación",
        recoveryId,
      };
    }

    await passwordResetRepository.invalidateActiveForUser(usuario.id);

    const otp = generarOtp();

    const recoveryHash = hashRecoveryId(recoveryId);

    const otpHash = hashOtp(recoveryId, otp);

    const expiresAt = new Date(Date.now() + OTP_MINUTOS * 60 * 1000);

    await passwordResetRepository.create({
      userId: usuario.id,
      recoveryHash,
      otpHash,
      expiresAt,
    });

    try {
      await emailService.enviarOtpRecuperacion(usuario.email, otp);
    } catch (error) {
      await passwordResetRepository.invalidateByRecoveryHash(recoveryHash);

      throw error;
    }

    return {
      message:
        "Si el correo está registrado, recibirás un código de verificación",
      recoveryId,
    };
  }

  async verificarOtp({ recoveryId, otp }) {
    const recoveryHash = hashRecoveryId(recoveryId);

    const solicitud =
      await passwordResetRepository.findByRecoveryHash(recoveryHash);

    if (!solicitud || solicitud.usedAt) {
      throw errorCodigo();
    }

    if (new Date(solicitud.expiresAt) <= new Date()) {
      throw errorCodigo();
    }

    if (solicitud.verifiedAt) {
      return {
        message: "Código verificado correctamente",
      };
    }

    if (solicitud.attempts >= MAX_INTENTOS) {
      const error = new Error(
        "Se alcanzó el máximo de intentos. Solicita un nuevo código.",
      );

      error.statusCode = 429;

      throw error;
    }

    const otpHashRecibido = hashOtp(recoveryId, otp);

    if (!compararHashes(solicitud.otpHash, otpHashRecibido)) {
      await passwordResetRepository.incrementAttempts(solicitud.id);

      if (solicitud.attempts + 1 >= MAX_INTENTOS) {
        const error = new Error(
          "Se alcanzó el máximo de intentos. Solicita un nuevo código.",
        );

        error.statusCode = 429;

        throw error;
      }

      throw errorCodigo();
    }

    await passwordResetRepository.markVerified(solicitud.id);

    return {
      message: "Código verificado correctamente",
    };
  }

  async restablecerPassword({ recoveryId, passwordNueva }) {
    const recoveryHash = hashRecoveryId(recoveryId);

    const solicitud =
      await passwordResetRepository.findByRecoveryHash(recoveryHash);

    if (!solicitud || solicitud.usedAt || !solicitud.verifiedAt) {
      const error = new Error(
        "La recuperación no es válida o no ha sido verificada",
      );

      error.statusCode = 400;

      throw error;
    }

    if (new Date(solicitud.expiresAt) <= new Date()) {
      const error = new Error("La recuperación ha expirado");

      error.statusCode = 400;

      throw error;
    }

    const passwordHash = await hashPassword(passwordNueva);

    const actualizado = await passwordResetRepository.resetPasswordAtomically({
      recoveryHash,
      passwordHash,
    });

    if (!actualizado) {
      const error = new Error("La recuperación no es válida o ha expirado");

      error.statusCode = 400;

      throw error;
    }

    return {
      message: "Contraseña actualizada correctamente",
    };
  }
}

module.exports = new PasswordResetService();
