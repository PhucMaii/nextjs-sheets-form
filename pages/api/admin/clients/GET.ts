import { PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function GET(req: NextApiRequest, res: NextApiResponse) {
  try {
    const prisma = new PrismaClient();

    // Get all clients
    const clientList = await prisma.user.findMany({
      where: {
        role: 'client'
      },
      include: {
        category: true,
        preference: true,
      },
    });

    return res.status(200).json({
      data: clientList,
      message: 'Fetch All Clients Successfully',
    });
  } catch (error: any) {
    console.log('Internal Server Error: ', error);
    return res.status(500).json({
      error: 'Internal Server Error: ' + error,
    });
  }
}
