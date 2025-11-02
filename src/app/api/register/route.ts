import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hash } from "bcrypt";
import { randomBytes } from "crypto";
import { sendEmail } from "@/lib/mailer";
import { withRateLimit } from "@/lib/withRateLimit";
import { rateLimiters } from "@/lib/rateLimit";
import { registerSchema } from "@/lib/zodSchemas";

async function registerHandler(req: Request) {
  try {
    const body = await req.json();

    // Validate input
    const validation = registerSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const { name, email, password } = validation.data;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser)
      return NextResponse.json(
        { error: "Email already in use" },
        { status: 409 }
      );

    const hashedPassword = await hash(password, 10);
    const verificationToken = randomBytes(32).toString("hex");
    const verificationTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        verificationToken,
        verificationTokenExpiry
      }
    });

    const verifyUrl = `${
      process.env.NEXTAUTH_URL
    }/api/verify?token=${verificationToken}&email=${encodeURIComponent(email)}`;

    await sendEmail({
      to: email,
      subject: "Verify your email",
      html: `<p>Welcome! Click <a href="${verifyUrl}">here</a> to verify your email.</p>`
    });

    return NextResponse.json(
      {
        ok: true,
        message:
          "User registered successfully. Please check your email to verify your account."
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("REGISTER_ERROR", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export const POST = withRateLimit(registerHandler, {
  limiter: rateLimiters.register,
  errorMessage: "Too many registration attempts. Please try again in an hour."
});
