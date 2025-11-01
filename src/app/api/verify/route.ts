import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const token = url.searchParams.get("token");
  const email = url.searchParams.get("email");
  if (!token || !email)
    return NextResponse.redirect(new URL("/login", process.env.NEXTAUTH_URL));

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || user.verificationToken !== token)
    return NextResponse.redirect(
      new URL("/login?verified=false", process.env.NEXTAUTH_URL)
    );

  await prisma.user.update({
    where: { email },
    data: { emailVerified: new Date(), verificationToken: null }
  });
  return NextResponse.redirect(
    new URL("/login?verified=true", process.env.NEXTAUTH_URL)
  );
}
