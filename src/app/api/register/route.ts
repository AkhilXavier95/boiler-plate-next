import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hash } from "bcrypt";
import { randomBytes } from "crypto";
import { sendEmail } from "@/lib/mailer";

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json();

    if (!email || !password)
      return NextResponse.json(
        { error: "Missing email or password" },
        { status: 400 }
      );

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser)
      return NextResponse.json(
        { error: "Email already in use" },
        { status: 409 }
      );

    const hashedPassword = await hash(password, 10);
    const verificationToken = randomBytes(32).toString("hex");

    await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        verificationToken
      }
    });

    const verifyUrl = `${
      process.env.NEXTAUTH_URL
    }/verify?token=${verificationToken}&email=${encodeURIComponent(email)}`;

    await sendEmail({
      to: email,
      subject: "Verify your email",
      html: `<p>Welcome! Click <a href="${verifyUrl}">here</a> to verify your email.</p>`
    });

    return NextResponse.json(
      { ok: true, message: "User registered successfully" },
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
