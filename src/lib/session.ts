import { SessionOptions } from "iron-session";

if (!process.env.SESSION_SECRET) {
  throw new Error("SESSION_SECRET environment variable is required for iron-session");
}

export const sessionOptions: SessionOptions = {
  cookieName: "myapp_session",
  password: process.env.SESSION_SECRET,
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7 // 7 days
  }
};

declare module "iron-session" {
  interface IronSessionData {
    user?: {
      id: string;
      email: string;
      name?: string | null;
    };
  }
}
