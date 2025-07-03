import { sortByDeliveryDate } from '@/pages/api/utils/date';
import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/client';

interface IQuery {
  name?: string;
  companyId?: string;
}

export default async function GET(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { name, companyId }: IQuery = req.query;

    if (!name) {
      return res.status(404).json({
        error: 'Action name is missing',
      });
    }

    const actions = await prisma.action.findMany({
      where: {
        name,
        companyId: Number(companyId),
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
