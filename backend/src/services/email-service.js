const nodemailer = require("nodemailer");
const { env } = require("../config/env");

const transporter = nodemailer.createTransport({
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
};

module.exports = { emailService };
