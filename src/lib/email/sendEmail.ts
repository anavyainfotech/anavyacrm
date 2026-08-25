import nodemailer from "nodemailer";

const smtpPort = parseInt(process.env.SMTP_PORT || "587", 10);
const isSecure = smtpPort === 465;

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: smtpPort,
  secure: isSecure, // true for 465, false for 587
  auth: {
    user: process.env.SMTP_USER || "anavyainfotech@gmail.com",
    pass: process.env.SMTP_PASS || "svcqpoovfegbxwbl",
  },
  tls: {
    rejectUnauthorized: false, // Prevents socket termination on serverless platforms
  },
});

export interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
  attachments?: Array<{
    filename: string;
    content?: string | Buffer;
    path?: string;
    contentType?: string;
  }>;
}

export async function sendEmail(options: SendEmailOptions) {
  try {
    const fromAddress = process.env.SMTP_FROM || `Anavya Infotech <${process.env.SMTP_USER || "anavyainfotech@gmail.com"}>`;
    
    const info = await transporter.sendMail({
      from: fromAddress,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text || options.html.replace(/<[^>]+>/g, ""),
      attachments: options.attachments,
    });

    console.log("Email sent successfully! MessageId:", info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error: any) {
    console.error("Error sending SMTP email:", error);
    return { success: false, error: error.message };
  }
}
