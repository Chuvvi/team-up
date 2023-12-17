import { createTransport } from "nodemailer";
import { compile } from "../config/pugCompiler";

async function fetchMailer() {
  return {
    email: process.env.MAILER_EMAIL,
    password: process.env.MAILER_PASSWORD,
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    alias: "Team Up",
  };
}

export async function sendMail(template, to, subject, data) {
  try {
    let sender = await fetchMailer();
    if (sender) {
      let transporter = await createTransport({
        //service: 'gmail',
        host: sender.host,
        port: sender.port,
        secure: sender.secure, // true for 465, false for other ports
        auth: {
          user: sender.email,
          pass: sender.password,
        },
      });
      let html = compile(template, data);
      let mailOptions = {
        from: `"${sender.alias}" ${sender.email}`, // sender address
        to: to, // list of receivers
        subject: subject, // Subject line
        text: "", // plain text body
        html: html, // html body
      };
      let info = await transporter.sendMail(mailOptions);
      await transporter.close();
      return console.log(
        `[${new Date().toUTCString()}]: Message sent: %s`,
        info.messageId
      );
    } else throw "Cannot send email : No mailer found";
  } catch (e) {
    return console.log(e);
  }
}
