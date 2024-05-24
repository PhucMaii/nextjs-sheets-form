import { PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';

interface QueryTypes {
    day?: string;
    clientList?: string;
}

export default async function GET(req: NextApiRequest, res: NextApiResponse) {
  try {
    const prisma = new PrismaClient();

    const { day, clientList }: QueryTypes = req.query;

    // const clientIds = clientList ? clientList.split(',').map(id => parseInt(id, 10)) : [];

    const clientIds = clientList ? clientList.split(',').map(id => parseInt(id)) : [];
    console.log({clientIds, clientList});
    const scheduleOrders = await prisma.scheduleOrders.findMany({
      where: {
        day,
        userId: {
          in: [...clientIds, 1, 2]
        }
      },
      include: {
        items: true,
        user: true,
      },
    });
    
    return res.status(200).json({
      data: scheduleOrders,
      message: 'Fetch Schedule Order Successfully',
    });
  } catch (error: any) {
    console.log('Internal Server Error: ' + error);
    return res.status(500).json({
      error: 'Internal Server Error: ' + error,
    });
  }
}
