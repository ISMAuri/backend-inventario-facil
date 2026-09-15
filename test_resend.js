require("dotenv").config();

const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

async function probarCorreo() {
  const { data, error } = await resend.emails.send({
    from: process.env.RESEND_FROM,
    to: "imcastillocastro@gmail.com",
    subject: "Prueba Inventario Fácil",
    html: `
      <h2>Inventario Fácil</h2>
      <p>Resend está funcionando correctamente.</p>
    `,
  });

  if (error) {
    console.error("❌ Error:", error);
    return;
  }

  console.log("✅ Correo enviado:", data);
}

probarCorreo();