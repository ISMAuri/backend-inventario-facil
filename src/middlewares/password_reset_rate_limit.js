const {
  rateLimit,
} = require("express-rate-limit");

const solicitarOtpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,

  message: {
    message:
      "Demasiadas solicitudes. Intenta nuevamente en unos minutos.",
  },
});

module.exports = {
  solicitarOtpLimiter,
};