import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { hash } from 'bcrypt';

type UserForm = {
  sheetName: string;
  clientId: string;
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
        clientId: userData.clientId,
      },
    });

    if (existingUser) {
      return res.status(400).json({ error: 'Client ID Already Existed' });
    }

    const password = await hash(userData.password, 12);
    const newUser = await prisma.user.create({
      data: {
        sheetName: userData.sheetName,
        clientId: userData.clientId,
        password,
      } as any,
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
