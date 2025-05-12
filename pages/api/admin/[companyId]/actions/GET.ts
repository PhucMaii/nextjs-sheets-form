import { sortByDeliveryDate } from '@/pages/api/utils/date';
import { PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';

interface IQuery {
  name?: string;
}

export default async function GET(req: NextApiRequest, res: NextApiResponse) {
  try {
    const prisma = new PrismaClient();

    const { name, companyId }: IQuery = req.query;

    if (!name) {
      return res.status(404).json({
        error: 'Action name is missing',
      });
    }

    const actions = await prisma.action.findMany({
      where: {
        name,
        companyId,
      },
    });

    if (actions.length === 0) {
      return res.status(200).json({
        data: [],
        message: 'Actions Not Available Yet.',
      });
    }

    const sortedActions = sortByDeliveryDate(actions, 'date', 'desc');

    return res.status(200).json({
      data: sortedActions,
      message: 'Fetch Actions Successfully',
    });
  } catch (error: any) {
    console.log('Internal Server Error: ', error);
    return res.status(500).json({
      error: 'Internal Server Error: ' + error,
    });
  }
}
