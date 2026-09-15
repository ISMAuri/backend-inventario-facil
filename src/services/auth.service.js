const userRepository = require("../repositories/user.repository");
const refreshTokenRepository = require("../repositories/refreshToken.repository");

const { hashPassword, comparePassword } = require("../utils/password");

const {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} = require("../utils/jwt");

class AuthService {
  // ---------------------------------------------------------------------
  // REGISTRO
  // ---------------------------------------------------------------------
  async register({ fullName, email, password, role }) {
    const existingUser = await userRepository.findByEmail(email);

    if (existingUser) {
      const error = new Error("El correo ya está registrado");

      error.statusCode = 409;
      throw error;
    }

    const passwordHash = await hashPassword(password);

    const user = await userRepository.create({
      fullName,
      email,
      passwordHash,
      role,
    });

    return this._issueTokens(user);
  }

  // ---------------------------------------------------------------------
  // LOGIN
  // ---------------------------------------------------------------------
  async login({ email, password, userAgent }) {
    const user = await userRepository.findByEmail(email);

    const invalidCredentialsError = () => {
      const error = new Error("Credenciales inválidas");

      error.statusCode = 401;
      return error;
    };

    if (!user) {
      throw invalidCredentialsError();
    }

    const isValidPassword = await comparePassword(password, user.passwordHash);

    if (!isValidPassword) {
      throw invalidCredentialsError();
    }

    return this._issueTokens(user, userAgent);
  }

  // ---------------------------------------------------------------------
  // REFRESH
  // ---------------------------------------------------------------------
  async refresh(oldRefreshToken) {
    let payload;

    try {
      payload = verifyRefreshToken(oldRefreshToken);
    } catch (err) {
      const error = new Error("Refresh token inválido o expirado");

      error.statusCode = 401;
      throw error;
    }

    const storedToken =
      await refreshTokenRepository.findValidToken(oldRefreshToken);

    if (!storedToken) {
      const error = new Error("La sesión fue revocada, inicia sesión de nuevo");

      error.statusCode = 401;
      throw error;
    }

    const user = await userRepository.findById(payload.sub);

    if (!user) {
      const error = new Error("Usuario no encontrado");

      error.statusCode = 404;
      throw error;
    }

    await refreshTokenRepository.revokeToken(oldRefreshToken);

    return this._issueTokens(user);
  }

  // ---------------------------------------------------------------------
  // LOGOUT
  // ---------------------------------------------------------------------
  async logout(refreshToken) {
    await refreshTokenRepository.revokeToken(refreshToken);
  }

  async logoutAllDevices(userId) {
    await refreshTokenRepository.revokeAllForUser(userId);
  }

  // ---------------------------------------------------------------------
  // OBTENER MI PERFIL
  // ---------------------------------------------------------------------
  async obtenerPerfil(userId) {
    const usuario = await userRepository.findById(userId);

    if (!usuario) {
      const error = new Error("Usuario no encontrado");

      error.statusCode = 404;
      throw error;
    }

    return usuario;
  }

  // ---------------------------------------------------------------------
  // ACTUALIZAR NOMBRE Y CORREO
  // ---------------------------------------------------------------------
  async actualizarPerfil(userId, { fullName, email }) {
    const usuario = await userRepository.findById(userId);

    if (!usuario) {
      const error = new Error("Usuario no encontrado");

      error.statusCode = 404;
      throw error;
    }

    const usuarioConCorreo = await userRepository.findByEmail(email);

    if (usuarioConCorreo && Number(usuarioConCorreo.id) !== Number(userId)) {
      const error = new Error("El correo ya está registrado por otro usuario");

      error.statusCode = 409;
      throw error;
    }

    return userRepository.updateProfile(userId, {
      fullName,
      email,
    });
  }

  // ---------------------------------------------------------------------
  // CAMBIAR CONTRASEÑA
  // ---------------------------------------------------------------------
  async cambiarPassword(userId, passwordNueva) {
    const usuario = await userRepository.findById(userId);

    if (!usuario) {
      const error = new Error("Usuario no encontrado");

      error.statusCode = 404;
      throw error;
    }

    const passwordHash = await hashPassword(passwordNueva);

    await userRepository.updatePassword(userId, passwordHash);
  }

  // ---------------------------------------------------------------------
  // OBTENER USUARIO POR ID
  // ---------------------------------------------------------------------
  async obtenerPorId(id) {
    const usuario = await userRepository.findById(id);

    if (!usuario) {
      const error = new Error("Usuario no encontrado");

      error.statusCode = 404;
      throw error;
    }

    return usuario;
  }

  // ---------------------------------------------------------------------
  // GENERAR TOKENS
  // ---------------------------------------------------------------------
  async _issueTokens(user, userAgent) {
    const accessToken = generateAccessToken(user);

    const { token: refreshToken, expiresAt } = generateRefreshToken(user);

    await refreshTokenRepository.create({
      token: refreshToken,
      userId: user.id,
      expiresAt,
      userAgent,
    });

    return {
      accessToken,
      refreshToken,

      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
      },
    };
  }
}

module.exports = new AuthService();
