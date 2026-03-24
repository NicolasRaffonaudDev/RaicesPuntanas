const nodemailer = require("nodemailer");
const { env } = require("../config");

const transporter = env.SMTP_HOST
  ? nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT || 587,
      secure: Boolean(env.SMTP_SECURE),
      auth: env.SMTP_USER && env.SMTP_PASS ? { user: env.SMTP_USER, pass: env.SMTP_PASS } : undefined,
    })
  : nodemailer.createTransport({
      jsonTransport: true,
    });

const emailService = {
  sendPasswordReset: async ({ to, resetToken }) => {
    await transporter.sendMail({
      from: env.SMTP_FROM,
      to,
      subject: "Reset de password",
      text: `Tu token de reset es: ${resetToken}`,
    });
  },

  sendConsultaReply: async ({ to, clienteNombre, asuntoConsulta, mensajeRespuesta }) => {
    await transporter.sendMail({
      from: env.SMTP_FROM,
      to,
      subject: `Respuesta a tu consulta: ${asuntoConsulta}`,
      text: `Hola ${clienteNombre || "cliente"},\n\nTe respondemos tu consulta:\n\n${mensajeRespuesta}\n\nEquipo Raices Puntanas.`,
      html: `
        <div style="font-family: Arial, sans-serif; color: #111;">
          <p>Hola ${clienteNombre || "cliente"},</p>
          <p>Te respondemos tu consulta:</p>
          <blockquote style="border-left: 4px solid #FFD700; margin: 12px 0; padding: 8px 12px; background: #faf7e6;">
            ${mensajeRespuesta}
          </blockquote>
          <p>Equipo Raices Puntanas.</p>
        </div>
      `,
    });
  },
};

module.exports = { emailService };
