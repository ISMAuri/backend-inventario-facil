const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

class EmailService {
  async enviarOtpRecuperacion(email, codigo) {
    const { data, error } = await resend.emails.send({
      from: process.env.RESEND_FROM,
      to: email,
      subject: "Código para recuperar tu contraseña - Inventario Fácil",
      html: `
        <div style="
          font-family: Arial, sans-serif;
          max-width: 520px;
          margin: 0 auto;
          padding: 24px;
          color: #222;
        ">
          <h2>Inventario Fácil</h2>

          <p>
            Recibimos una solicitud para restablecer
            la contraseña de tu cuenta.
          </p>

          <p>Tu código de verificación es:</p>

          <div style="
            font-size: 34px;
            font-weight: bold;
            letter-spacing: 8px;
            text-align: center;
            margin: 28px 0;
          ">
            ${codigo}
          </div>

          <p>Este código expira en 10 minutos.</p>

          <p style="color: #666; font-size: 13px;">
            Si no solicitaste este cambio,
            puedes ignorar este correo.
          </p>
        </div>
      `,
    });

    if (error) {
      console.error("Error Resend:", error);

      const err = new Error("No se pudo enviar el código de recuperación");
      err.statusCode = 502;

      throw err;
    }

    return data;
  }
}

module.exports = new EmailService();
