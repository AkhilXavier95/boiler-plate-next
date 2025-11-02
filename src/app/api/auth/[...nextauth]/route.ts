import NextAuth, { AuthOptions, User } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import { compare } from "bcrypt";
import { JWT } from "next-auth/jwt";

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

        // Normalize email
        const normalizedEmail = credentials.email.trim().toLowerCase();

        const user = await prisma.user.findUnique({
          where: { email: normalizedEmail }
        });

        if (!user) throw new Error("Invalid email or password");

        const isValid = await compare(credentials.password, user.password);
        if (!isValid) throw new Error("Invalid email or password");

        // if (!user.emailVerified)
        //   throw new Error("Please verify your email before logging in");

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          emailVerified: !!user.emailVerified
        } as User & { emailVerified: boolean };
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
    async jwt({ token, user }): Promise<JWT> {
      // Only update token on initial login (when user object exists)
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.emailVerified = (user as any).emailVerified;
      }

      // No database queries on every request - trust the JWT token
      // Token was verified at login time, so we can trust it
      return token;
    },

    async session({ session, token }) {
      if (session.user && token) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;

        // If email verification was revoked, invalidate session
        if (token.emailVerified === false) {
          return {
            ...session,
            user: {
              ...session.user,
              id: undefined,
              email: undefined
            }
          };
        }
      }
      return session;
    }
  },

  pages: {
    signIn: "/login",
    error: "/login"
  },

  secret:
    process.env.NEXTAUTH_SECRET ||
    (() => {
      if (process.env.NODE_ENV === "production") {
        throw new Error("NEXTAUTH_SECRET is required in production");
      }
      console.warn(
        "⚠️  NEXTAUTH_SECRET is not set. Using default secret for development only."
      );
      return "development-secret-change-in-production";
    })()
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
