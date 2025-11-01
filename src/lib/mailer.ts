import nodemailer from "nodemailer";

const transport =
  process.env.NODE_ENV === "production"
    ? nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT),
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        }
      })
    : null;

export async function sendEmail({ to, subject, html, text }: any) {
  const from = process.env.FROM_EMAIL || "dev@example.com";

  if (process.env.NODE_ENV !== "production") {
    console.log("📨 [DEV MODE] Email not sent. Payload:");
    console.log({ from, to, subject, text });
    return;
  }

  if (!transport) throw new Error("Mail transport not configured");
  await transport.sendMail({ from, to, subject, html, text });
}
