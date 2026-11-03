const nodemailer = require("nodemailer");
const mailConfig = require("./constants/MailingInformation");

const transporter = nodemailer.createTransport({
  host: mailConfig.smtpHost,
  port: mailConfig.smtpPort,
  secure: mailConfig.secure || false,
  auth: {
    user: mailConfig.username,
    pass: mailConfig.password
  }
});

module.exports = class Mailer {
  static async send(name, sender, receiver, subject, content) {
    try {
      const result = await transporter.sendMail({
        from: { name: name, address: sender },
        to: receiver,
        subject: subject,
        html: content
      });

      return {
        success: true,
        info: result
      };
    } catch (err) {
      const isQuotaError =
        err.message.includes("quota") ||
        err.message.includes("Rate limit") ||
        err.message.includes("Daily sending limit");

      return {
        success: false,
        error: err.message,
        quotaExceeded: isQuotaError
      };
    }
  }
}