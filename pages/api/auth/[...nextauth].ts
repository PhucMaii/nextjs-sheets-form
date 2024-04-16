/* eslint-disable @typescript-eslint/no-unused-vars */
import { PrismaClient } from '@prisma/client';
import { compare } from 'bcrypt';
import NextAuth, { getServerSession, type NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@next-auth/prisma-adapter';

const prisma = new PrismaClient();
export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: 'jwt',
  },
  secret: 'secret',
  providers: [
    CredentialsProvider({
      credentials: {
        clientId: {
          label: 'Client Id',
          type: 'text',
        },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        console.log(credentials, 'credentials');
        try {
          if (!credentials?.clientId || !credentials?.password) {
            throw new Error('Email or Password missing');
          }
          const user = await prisma.user.findUnique({
            where: {
              clientId: credentials.clientId,
            },
          });
          if (!user) {
            throw new Error('User does not Exist');
          }
          const isPasswordValid = await compare(
            credentials.password,
            user.password,
          );
          if (!isPasswordValid) {
            throw new Error('Incorrect Credentials');
          }
          return {
            id: user.id + '',
            clientId: user.clientId,
            sheetName: user.sheetName,
            role: user.role,
          };
        } catch (error: any) {
          console.error('Authorize error: ', error);
          return null;
        }
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
  },
};

const handler = NextAuth(authOptions);
export { handler as default };
