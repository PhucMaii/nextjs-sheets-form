import { PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';

interface IQuery {
  id?: string;
  inventoryItemId?: string;
}

export default async function GET(req: NextApiRequest, res: NextApiResponse) {
  try {
    const prisma = new PrismaClient();

    const { id, inventoryItemId }: IQuery = req.query;

    if (Number(id) === 1) {
      const targetFifo = await prisma.fifo.findUnique({
        where: {
          id: Number(id),
        },
      });

      if (!targetFifo) {
        return res.status(404).json({
          error: 'FIFO Id Not Found',
        });
      }

      return res.status(200).json({
        data: targetFifo,
      });
    }

    if (id) {
      const targetFifo = await prisma.fifo.findUnique({
        where: {
          id: Number(id),
        },
        include: {
          orderedItems: {
            where: {
              orderId: {
                not: null,
              },
            },
          },
        },
      });

      if (!targetFifo) {
        return res.status(404).json({
          error: 'FIFO Id Not Found',
        });
      }

      return res.status(200).json({
        data: targetFifo,
      });
    }

    if (inventoryItemId) {
      const fifoList = await prisma.fifo.findMany({
        where: {
          inventoryItemId: Number(inventoryItemId),
        },
        include: {
          vendorItem: {
            include: {
              vendor: true,
            },
          },
          orderedItems: {
            where: {
              orderId: {
                not: null,
              },
            },
          },
        },
      });

      return res.status(200).json({
        data: fifoList,
      });
    }

    return res.status(404).json({
      error: 'FIFO Id Or Inventory Item Id Not Provided',
    });
  } catch (error: any) {
    console.log('Internal Server Error: ', error);
    return res.status(500).json({
      error: 'Internal Server Error: ' + error,
    });
  }
}
