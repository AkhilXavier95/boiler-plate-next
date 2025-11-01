import NextAuth, { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import { compare } from "bcrypt";

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password)
          throw new Error("Missing email or password");

        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        });

        if (!user) throw new Error("Invalid email or password");

        const isValid = await compare(credentials.password, user.password);
        if (!isValid) throw new Error("Invalid email or password");

        if (!user.emailVerified)
          throw new Error("Please verify your email before logging in");

        return {
          id: user.id,
          name: user.name,
          email: user.email
        };
      }
    })
  ],

  session: {
    strategy: "jwt",
    maxAge: 7 * 24 * 60 * 60 // 7 days
  },

  jwt: {
    maxAge: 7 * 24 * 60 * 60
  },

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
      }
      return token;
    },

    async session({ session, token }) {
      if (token) {
        session.user = {
          id: token.id,
          email: token.email
        } as any;
      }
      return session;
    }
  },

  pages: {
    signIn: "/login",
    error: "/login"
  },

  secret: process.env.NEXTAUTH_SECRET
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
