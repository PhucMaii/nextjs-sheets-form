import { PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function GET(req: NextApiRequest, res: NextApiResponse) {
  try {
    const prisma = new PrismaClient();

    const userId: string = req.query.id as string;

    const existingUser = await prisma.user.findUnique({
      where: {
        id: parseInt(userId),
      },
    });

    if (!existingUser) {
      return res.status(404).json({ error: 'User Not Found' });
    }

    return res.status(200).json({
      data: existingUser,
      message: 'Fetch User Successfully',
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      error: 'Internal Server Occur in GET USER request',
    });
  }
}
