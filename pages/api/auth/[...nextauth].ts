/* eslint-disable @typescript-eslint/no-unused-vars */
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import NextAuth, { getServerSession, type NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import { USER_CATEGORIZED } from '@/app/utils/enum';

const prisma = new PrismaClient();

// Define custom types for our user data
interface CustomUser {
  id: number;
  role: string;
  clientId?: string;
  clientName?: string;
  contactNumber?: string;
  deliveryAddress?: string;
  email?: string | null;
  companyId?: number | null;
  categoryId?: number | null;
  subCategoryId?: number | null;
  type?: string;
  sheetName?: string | null;
  contactName?: string | null;
}

// Extend the built-in session type
declare module 'next-auth' {
  interface Session {
    user: CustomUser & {
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: 'jwt',
  },
  secret: 'secret',
  providers: [
    CredentialsProvider({
      credentials: {
        employeeCode: {
          label: 'Employee Code',
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

          console.log({ credentials }, 'credentials');

          if (credentials?.clientId) {
            const userData = await loginUser(credentials);
            return userData as any; // Type assertion needed due to NextAuth's type constraints
          }

          if (credentials?.employeeCode) {
            const employeeData = await loginEmployee(credentials);
            return employeeData as any; // Type assertion needed due to NextAuth's type constraints
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
    async jwt({ token, user }: any) {
      if (user) {
        // Add user data to the token
        return {
          ...token,
          ...user,
          id: user.id,
          // role: token.role,
          // clientId: user.clientId,
          // clientName: user.clientName,
          // contactNumber: user.contactNumber,
          // deliveryAddress: user.deliveryAddress,
          // email: user.email,
          // companyId: user.companyId,
          // categoryId: user.categoryId,
          // subCategoryId: user.subCategoryId,
          // type: user.type,
          // sheetName: user.sheetName,
          // contactName: user.contactName,
        };
      }
      return token;
    },
    async session({ session, token }) {
      // Add token data to the session
      console.log({name: token?.name, clientName: token?.clientName, id: token.id, role: token?.role});
      return {
        ...session,
        user: {
          ...session.user,
          ...token,
          id: token.id as number,
          // role: token.role as string,
          // clientId: token.clientId as string,
          // clientName: token.clientName as string,
          // contactNumber: token.contactNumber as string,
          // deliveryAddress: token.deliveryAddress as string,
          // email: token.email as string,
          // companyId: token.companyId as number,
          // categoryId: token.categoryId as number,
          // subCategoryId: token.subCategoryId as number,
          // type: token.type as string,
          // sheetName: token.sheetName as string,
          // contactName: token.contactName as string,
        },
      };
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

  const { password, ...userData } = user;
  return userData;
};

const loginEmployee = async (credentials: any) => {
  const prisma = new PrismaClient();

  const employee = await prisma.employee.findFirst({
    where: {
      employeeCode: credentials.employeeCode,
    },
  });
  if (!employee) {
    throw new Error('Employee code does not Exist');
  }
  
  const isPasswordValid = await bcrypt.compare(
    credentials.password,
    employee.password,
  );
  if (!isPasswordValid) {
    throw new Error('Incorrect Credentials');
  }

  const { password, ...employeeData } = employee;
  return employeeData;
};
