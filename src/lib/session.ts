import { SessionOptions } from "iron-session";

export const sessionOptions: SessionOptions = {
  cookieName: "myapp_session",
  password: process.env.SESSION_SECRET!,
  cookieOptions: {
    secure: process.env.NODE_ENV === "production"
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
