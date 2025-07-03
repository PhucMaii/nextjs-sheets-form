import withAdminAuthGuard from '@/pages/api/utils/withAdminAuthGuard';
import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/client';

interface IQuery {
  itemName?: string;
  selectedCategoryIds?: string;
}

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    if (req.method !== 'GET') {
      return res.status(404).json({ error: 'Your method is not supported' });
    }

    const { itemName, selectedCategoryIds }: IQuery = req.query;

    if (!itemName || !selectedCategoryIds) {
      return res.status(404).json({ error: 'Parameters are missing' });
    }

    // Multiple Category Ids will have the new option
    const selectedCategoryIdsArray = selectedCategoryIds
      ? selectedCategoryIds.split(',').map((id: string) => Number(id))
      : [];

    const preOrderedItems = await prisma.orderedItems.findMany({
      where: {
        name: itemName,
        ScheduleOrders: {
          user: {
            category: {
              id: {
                in: selectedCategoryIdsArray,
              },
            },
          },
        },
      },
      include: {
        ScheduleOrders: {
          include: {
            user: true,
          },
        },
      },
    });

    return res.status(200).json({ data: preOrderedItems });
  } catch (error: any) {
    console.log('Internal Server Error: ', error);
    return res.status(500).json({ error: 'Internal Server Error: ' + error });
  }
};

export default withAdminAuthGuard(handler);
