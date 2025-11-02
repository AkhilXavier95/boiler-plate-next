import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { randomBytes } from "crypto";
import { sendEmail } from "@/lib/mailer";
import { withRateLimit } from "@/lib/withRateLimit";
import { rateLimiters } from "@/lib/rateLimit";
import { resendVerificationSchema } from "@/lib/zodSchemas";

async function resendVerificationHandler(req: Request) {
  try {
    const body = await req.json();

    // Validate input
    const validation = resendVerificationSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const { email } = validation.data;

    const user = await prisma.user.findUnique({ where: { email } });

    // Don't reveal if email exists (security best practice)
    if (!user) {
      return NextResponse.json(
        { message: "If that email exists and is unverified, we've sent a verification email." },
        { status: 200 }
      );
    }

    // If already verified, don't reveal it
    if (user.emailVerified) {
      return NextResponse.json(
        { message: "If that email exists and is unverified, we've sent a verification email." },
        { status: 200 }
      );
    }

    // Generate new verification token
    const verificationToken = randomBytes(32).toString("hex");
    const verificationTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    await prisma.user.update({
      where: { email },
      data: {
        verificationToken,
        verificationTokenExpiry
      }
    });

    const verifyUrl = `${process.env.NEXTAUTH_URL}/api/verify?token=${verificationToken}&email=${encodeURIComponent(email)}`;

    await sendEmail({
      to: email,
      subject: "Verify your email",
      html: `
        <p>You requested a new verification email. Click <a href="${verifyUrl}">here</a> to verify your email.</p>
        <p>This link will expire in 24 hours.</p>
        <p>If you didn't request this, please ignore this email.</p>
      `
    });

    return NextResponse.json(
      { message: "If that email exists and is unverified, we've sent a verification email." },
      { status: 200 }
    );
  } catch (error) {
    console.error("Resend verification error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export const POST = withRateLimit(resendVerificationHandler, {
  limiter: rateLimiters.verify,
  errorMessage: "Too many verification requests. Please try again later."
});

