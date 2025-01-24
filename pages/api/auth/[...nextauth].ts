/* eslint-disable @typescript-eslint/no-unused-vars */
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import NextAuth, { getServerSession, type NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import { USER_CATEGORIZED } from '@/app/utils/enum';

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
        driverName: {
          label: 'Driver Name',
          type: 'text',
        },
        clientId: {
          label: 'Client Id',
          type: 'text',
        },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        try {
          if (!credentials?.password) {
            throw new Error('Password missing');
          }

          if (credentials?.clientId) {
            const userData = await loginUser(credentials);
            return userData;
          }

          if (credentials?.driverName) {
            const driverData = await loginDriver(credentials);
            return driverData;
          }

          throw new Error('Credentials missing');
        } catch (error: any) {
          console.error('Authorize error: ', error);
          throw new Error(error);
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

const loginUser = async (credentials: any) => {
  const prisma = new PrismaClient();

  const user = await prisma.user.findUnique({
    where: {
      clientId: credentials.clientId,
    },
  });

  // Handle user input incorrect data
  if (!user) {
    throw new Error('User does not Exist');
  }

  // Handle user account is inactive
  if (user?.type === USER_CATEGORIZED.INACTIVE) {
    throw new Error('User Account Is Inactive');
  }

  const isPasswordValid = await bcrypt.compare(
    credentials.password,
    user.password,
  );
  if (!isPasswordValid) {
    throw new Error('Your password is incorrect');
  }
  return {
    id: user.id + '',
    clientId: user.clientId,
    clientName: user.clientName,
    role: user.role,
  };
};

const loginDriver = async (credentials: any) => {
  const prisma = new PrismaClient();

  const driver = await prisma.driver.findFirst({
    where: {
      name: credentials.driverName,
    },
  });
  if (!driver) {
    throw new Error('Driver name does not Exist');
  }
  const isPasswordValid = await bcrypt.compare(
    credentials.password,
    driver.password,
  );
  if (!isPasswordValid) {
    throw new Error('Incorrect Credentials');
  }
  return {
    id: driver.id + '',
    name: driver.name,
  };
};
