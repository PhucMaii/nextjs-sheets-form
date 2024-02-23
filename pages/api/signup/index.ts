import { NextApiRequest, NextApiResponse } from 'next';
import { Prisma, PrismaClient } from '@prisma/client';
import { hash } from 'bcrypt';

type UserForm = {
  firstName: string;
  clientId: string;
  email: string;
  password: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const prisma = new PrismaClient();
  if (req.method !== 'POST') {
    return res.status(500).json({ error: 'Only POST method allowed' });
  }
  try {
    const userData: UserForm = req.body;
    const existingUser = await prisma.user.findUnique({
      where: {
        email: userData.email,
      },
    });

    if (existingUser) {
      return res.status(400).json({ error: 'Email Already Existed' });
    }

    const password = await hash(userData.password, 12);
    const newUser = await prisma.user.create({
      data: {
        firstName: userData.firstName,
        clientId: userData.clientId,
        email: userData.email,
        password,
      } as Prisma.UserCreateInput,
    });
    return res.status(201).json({
      data: newUser,
      message: `Register Successfully, Let's Log Back In`,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
