const authService = require("../services/auth.service");

const REFRESH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict",
  maxAge: 7 * 24 * 60 * 60 * 1000,
  path: "/api/auth",
};

class AuthController {
  async register(req, res, next) {
    try {
      const { fullName, email, password, role } = req.body;

      const { accessToken, refreshToken, user } = await authService.register({
        fullName,
        email,
        password,
        role,
      });

      res.cookie("refreshToken", refreshToken, REFRESH_COOKIE_OPTIONS);

      res.status(201).json({
        accessToken,
        user,
      });
    } catch (err) {
      next(err);
    }
  }

  async login(req, res, next) {
    try {
      const { email, password } = req.body;

      const { accessToken, refreshToken, user } = await authService.login({
        email,
        password,
        userAgent: req.headers["user-agent"],
      });

      res.cookie("refreshToken", refreshToken, REFRESH_COOKIE_OPTIONS);

      res.status(200).json({
        accessToken,
        user,
      });
    } catch (err) {
      next(err);
    }
  }

  async refresh(req, res, next) {
    try {
      const oldRefreshToken = req.cookies?.refreshToken;

      if (!oldRefreshToken) {
        return res.status(401).json({
          message: "No hay sesión activa",
        });
      }

      const { accessToken, refreshToken, user } =
        await authService.refresh(oldRefreshToken);

      res.cookie("refreshToken", refreshToken, REFRESH_COOKIE_OPTIONS);

      res.status(200).json({
        accessToken,
        user,
      });
    } catch (err) {
      next(err);
    }
  }

  async logout(req, res, next) {
    try {
      const refreshToken = req.cookies?.refreshToken;

      if (refreshToken) {
        await authService.logout(refreshToken);
      }

      res.clearCookie("refreshToken", REFRESH_COOKIE_OPTIONS);

      res.status(204).send();
    } catch (err) {
      next(err);
    }
  }

  async obtenerPerfil(req, res, next) {
    try {
      const usuario = await authService.obtenerPerfil(req.user.id);

      res.status(200).json(usuario);
    } catch (err) {
      next(err);
    }
  }

  async actualizarPerfil(req, res, next) {
    try {
      const { fullName, email } = req.body;

      const usuario = await authService.actualizarPerfil(req.user.id, {
        fullName,
        email,
      });

      res.status(200).json({
        message: "Perfil actualizado correctamente",
        user: usuario,
      });
    } catch (err) {
      next(err);
    }
  }

  async cambiarPassword(req, res, next) {
    try {
      const { passwordNueva } = req.body;

      await authService.cambiarPassword(req.user.id, passwordNueva);

      res.status(200).json({
        message: "Contraseña actualizada correctamente",
      });
    } catch (err) {
      next(err);
    }
  }

  async obtenerUsuario(req, res, next) {
    try {
      const usuario = await authService.obtenerPorId(req.params.id);

      res.status(200).json(usuario);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new AuthController();
