import { IronSession } from "iron-session";

export const sessionOptions = {
    password: process.env.TOKEN_SECRET as string, // Ensure TOKEN_SECRET is defined in .env
    cookieName: 'guest-session',
    cookieOptions: {
      secure: true, // Use HTTPS in production
      httpOnly: true, // Prevent client-side access
    },
};

export interface SessionData {
    guestSessionId?: string;
}

export type IronSessionWithSessionData = IronSession<any> & SessionData;