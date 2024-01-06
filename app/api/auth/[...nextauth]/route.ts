/* eslint-disable @typescript-eslint/no-unused-vars */
import { PrismaClient } from '@prisma/client';
import { compare } from 'bcrypt';
import NextAuth, { getServerSession, type NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

const prisma = new PrismaClient();
export const authOptions: NextAuthOptions = {
  session: {
    strategy: 'jwt',
  },
  providers: [
    CredentialsProvider({
      credentials: {
        email: {
          label: 'Email',
          type: 'email',
          placeholder: 'hello@example.com',
        },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        // Check if user is already authenticated
        const existingSession = await getServerSession(authOptions);
        if (existingSession) {
          return null;
        }
        console.log(existingSession);
        if (!credentials?.email || !credentials?.password) {
          return null;
        }
        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email,
          },
        });
        if (!user) {
          return null;
        }
        const isPasswordValid = await compare(
          credentials.password,
          user.password,
        );
        if (!isPasswordValid) {
          return null;
        }
        return {
          id: user.id + '',
          email: user.email,
          firtName: user.firstName,
        };
      },
    }),
  ],
  callbacks: {
    session: ({ session, token }) => {
      return {
        ...session,
        user: {
          ...session.user,
          id: token.id,
        },
      };
    },
    jwt: ({ token, user }) => {
      if (user) {
        const u = user as unknown as any;
        return {
          ...token,
          id: u.id,
        };
      }
      return token;
    },
    // signIn: ({ user, account, profile, email, credentials }) => {
    //   return true;
    // },
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
