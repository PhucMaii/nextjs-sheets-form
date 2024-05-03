import { PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';
import { initializeSheduleOrder } from '../clients/PUT';

export default async function POST(req: NextApiRequest, res: NextApiResponse) {
  try {
    const prisma = new PrismaClient();

    const { userId } = req.body;

    const existingUser = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!existingUser) {
      return res.status(404).json({
        error: 'User Not Found',
      });
    }

    const newScheduleOrder = await initializeSheduleOrder(existingUser);

    return res.status(201).json({
      data: newScheduleOrder,
      message: 'New Schedule Order Created',
    });
  } catch (error: any) {
    console.log('Internal Server Error: ' + error);
    return res.status(500).json({
      error: 'Internal Server Error: ' + error,
    });
  }
}
