import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { withRateLimit } from "@/lib/withRateLimit";
import { rateLimiters } from "@/lib/rateLimit";

async function verifyHandler(req: Request) {
  try {
    const url = new URL(req.url);
    const token = url.searchParams.get("token");
    const email = url.searchParams.get("email");

    if (!token || !email) {
      return NextResponse.redirect(
        new URL(
          "/login?error=missing_params",
          process.env.NEXTAUTH_URL || "http://localhost:3000"
        )
      );
    }

    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        verificationToken: true,
        verificationTokenExpiry: true,
        emailVerified: true
      }
    });
    if (!user || user.verificationToken !== token) {
      return NextResponse.redirect(
        new URL(
          "/login?verified=false",
          process.env.NEXTAUTH_URL || "http://localhost:3000"
        )
      );
    }

    // Check if token has expired
    if (
      user.verificationTokenExpiry &&
      user.verificationTokenExpiry < new Date()
    ) {
      return NextResponse.redirect(
        new URL(
          "/login?verified=expired",
          process.env.NEXTAUTH_URL || "http://localhost:3000"
        )
      );
    }

    // Check if already verified
    if (user.emailVerified) {
      return NextResponse.redirect(
        new URL(
          "/login?verified=already",
          process.env.NEXTAUTH_URL || "http://localhost:3000"
        )
      );
    }

    await prisma.user.update({
      where: { email },
      data: {
        emailVerified: new Date(),
        verificationToken: null,
        verificationTokenExpiry: null
      }
    });

    return NextResponse.redirect(
      new URL(
        "/login?verified=true",
        process.env.NEXTAUTH_URL || "http://localhost:3000"
      )
    );
  } catch (error) {
    console.error("Verification error:", error);
    return NextResponse.redirect(
      new URL(
        "/login?verified=false",
        process.env.NEXTAUTH_URL || "http://localhost:3000"
      )
    );
  }
}

export const GET = withRateLimit(verifyHandler, {
  limiter: rateLimiters.verify,
  errorMessage: "Too many verification attempts. Please try again later."
});
