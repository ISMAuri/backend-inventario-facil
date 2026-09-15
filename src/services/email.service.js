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
      background-color: #f5f7fa;
      padding: 32px 16px;
    ">
      <div style="
        max-width: 520px;
        margin: 0 auto;
        background-color: #ffffff;
        border-radius: 16px;
        overflow: hidden;
        box-shadow: 0 4px 14px rgba(0,0,0,0.08);
      ">

        <!-- Encabezado -->
        <div style="
          text-align: center;
          padding: 28px 24px 20px;
        ">
          <img
            src="https://api2.ismaelcastillo.me/app-icon.png"
            alt="Inventario Fácil"
            width="70"
            style="
              display: block;
                margin: 0 auto 12px;
            border-radius: 16px;
            "
          >

          <h2 style="
            margin: 0;
            color: #222;
          ">
            Inventario Fácil
          </h2>
        </div>

        <!-- Contenido -->
        <div style="
          padding: 0 32px 32px;
          color: #333;
        ">

          <p style="font-size: 15px; line-height: 1.6;">
            Recibimos una solicitud para restablecer
            la contraseña de tu cuenta.
          </p>

          <p style="
            font-size: 15px;
            text-align: center;
            margin-top: 28px;
          ">
            Tu código de verificación es:
          </p>

          <!-- Código OTP -->
          <div style="
            background-color: #f3f4f6;
            border-radius: 12px;
            font-size: 34px;
            font-weight: bold;
            letter-spacing: 8px;
            text-align: center;
            margin: 18px 0;
            padding: 22px 10px;
            color: #222;
          ">
            ${codigo}
          </div>

          <p style="
            text-align: center;
            font-size: 14px;
            color: #666;
          ">
            Este código expira en <strong>10 minutos</strong>.
          </p>

          <!-- Seguridad -->
          <div style="
            margin-top: 28px;
            padding: 14px;
            background-color: #fff8e1;
            border-radius: 10px;
            font-size: 13px;
            color: #665c00;
            line-height: 1.5;
          ">
            Por seguridad, no compartas este código con ninguna persona.
          </div>

          <p style="
            margin-top: 24px;
            color: #777;
            font-size: 13px;
            line-height: 1.5;
          ">
            Si no solicitaste este cambio, puedes ignorar este correo.
            Tu contraseña permanecerá sin cambios.
          </p>

        </div>

        <!-- Footer -->
        <div style="
          border-top: 1px solid #eeeeee;
          padding: 18px;
          text-align: center;
          color: #999;
          font-size: 12px;
        ">
          Inventario Fácil · Sistema de gestión de inventario y ventas
        </div>

      </div>
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
