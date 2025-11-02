import nodemailer from "nodemailer";
import { EmailOptions } from "@/types/email";

let transport: nodemailer.Transporter | null = null;

async function getTransport() {
  if (transport) return transport;

  if (process.env.NODE_ENV === "production") {
    if (!process.env.SMTP_HOST || !process.env.SMTP_PORT || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
      throw new Error("SMTP configuration is missing. Please set SMTP_HOST, SMTP_PORT, SMTP_USER, and SMTP_PASS environment variables.");
    }
    transport = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: process.env.SMTP_PORT === "465",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  } else {
    // Use Ethereal Email test account for development
    try {
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
    } catch (error) {
      console.error("Failed to create test email account:", error);
      throw new Error("Failed to initialize email service for development");
    }
  }

  return transport;
}

export async function sendEmail({ to, subject, html, text }: EmailOptions) {
  try {
    const from = process.env.FROM_EMAIL || process.env.SMTP_USER || "dev@example.com";
    const transporter = await getTransport();

    if (!to) {
      throw new Error("Email recipient is required");
    }

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
  } catch (error) {
    console.error("Email sending error:", error);
    throw new Error("Failed to send email. Please check your email configuration.");
  }
}
