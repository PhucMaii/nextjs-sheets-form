import { PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';

interface IBody {
  removedId?: number;
  removedIdList?: number[];
}

export default async function DELETE(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  try {
    const prisma = new PrismaClient();

    const { removedId, removedIdList }: IBody = req.body;

    if (removedId) {
      const deletedItem = await prisma.item.delete({
        where: {
          id: removedId,
        },
      });
      return res.status(200).json({
        message: `${deletedItem.name} Deleted Successfully`,
      });
    }

    if (removedIdList) {
      await prisma.item.deleteMany({
        where: {
          id: {
            in: removedIdList,
          },
        },
      });

      return res.status(200).json({
        message: 'Items Deleted Successfully',
      });
    }

    return res.status(404).json({
      error: 'Neither removed id nor removed id list provided',
    });
  } catch (error: any) {
    console.log('Internal Server Error: ', error);
    return res.status(500).json({
      error: 'Internal Server Error: ' + error,
    });
  }
}
