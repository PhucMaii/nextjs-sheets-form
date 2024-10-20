import { PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';

interface IQuery {
  id?: string;
}

export default async function GET(req: NextApiRequest, res: NextApiResponse) {
  try {
    const prisma = new PrismaClient();

    const { id }: IQuery = req.query;

    if (!id) {
      const allMethods = await prisma.paymentMethod.findMany();
      return res.status(200).json({
        data: allMethods,
        message: 'Fetch Payment Methods Successfully',
      });
    }

    const method = await prisma.paymentMethod.findUnique({
      where: {
        id: Number(id),
      },
    });

    return res.status(200).json({
      data: method,
      message: 'Fetch Payment Method Successfully',
    });
  } catch (error: any) {
    console.log('Internal Server Error: ', error);
    return res.status(500).json({ error: 'Internal Server Error: ' + error });
  }
}
