import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hash, compare } from "bcrypt";
import { withRateLimit } from "@/lib/withRateLimit";
import { rateLimiters } from "@/lib/rateLimit";
import { resetPasswordSchema } from "@/lib/zodSchemas";

async function resetPasswordHandler(req: Request) {
  try {
    const body = await req.json();

    // Validate input
    const validation = resetPasswordSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const { token, email, password } = validation.data;

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || user.resetToken !== token) {
      return NextResponse.json(
        { error: "Invalid or expired reset token" },
        { status: 400 }
      );
    }

    // Check if token has expired
    if (!user.resetTokenExpiry || user.resetTokenExpiry < new Date()) {
      return NextResponse.json(
        { error: "Reset token has expired. Please request a new one." },
        { status: 400 }
      );
    }

    // Check if new password is same as current password
    const isSamePassword = await compare(password, user.password);
    if (isSamePassword) {
      return NextResponse.json(
        { error: "New password must be different from your current password" },
        { status: 400 }
      );
    }

    // Hash new password
    const hashedPassword = await hash(password, 10);

    // Update user password and clear reset token
    await prisma.user.update({
      where: { email },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null
      }
    });

    return NextResponse.json(
      { message: "Password reset successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Reset password error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export const POST = withRateLimit(resetPasswordHandler, {
  limiter: rateLimiters.passwordReset,
  errorMessage: "Too many password reset attempts. Please try again in an hour."
});

