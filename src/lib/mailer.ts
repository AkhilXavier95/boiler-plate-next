import nodemailer from "nodemailer";
import { EmailOptions } from "@/types/email";

let transport: nodemailer.Transporter | null = null;

async function getTransport() {
  if (transport) return transport;

  if (process.env.NODE_ENV === "production") {
    transport = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  } else {
    // Use Ethereal Email test account for development
    const testAccount = await nodemailer.createTestAccount();
    transport = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass
      }
    });
  }

  return transport;
}

export async function sendEmail({ to, subject, html, text }: EmailOptions) {
  const from = process.env.FROM_EMAIL || "dev@example.com";
  const transporter = await getTransport();

  const info = await transporter.sendMail({
    from,
    to: Array.isArray(to) ? to.join(", ") : to,
    subject,
    html,
    text
  });

  // In development, log the preview URL for viewing the email
  if (process.env.NODE_ENV !== "production") {
    const previewUrl = nodemailer.getTestMessageUrl(info);
    console.log("📨 [DEV MODE] Email sent to mock SMTP server");
    console.log("Preview URL:", previewUrl || "Not available");
    console.log("Message ID:", info.messageId);
    console.log("To:", to);
    console.log("Subject:", subject);
  }

  return info;
}
