import { PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';

interface IQuery {
  id?: string;
  nextFifoId?: string; // Calculate Next FIFO from client side
}

export default async function DELETE(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  try {
    const prisma = new PrismaClient();

    const { id, nextFifoId }: IQuery = req.query;

    if (!id) {
      return res.status(404).json({
        error: 'FIFO Id Not Provided',
      });
    }

    console.log({ id, nextFifoId });

    // Check if FIFO exists
    const existingFifo = await prisma.fifo.findUnique({
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

    if (!existingFifo) {
      return res.status(404).json({
        error: 'FIFO Not Found',
      });
    }

    // Check if FIFO has ordered items
    if (!nextFifoId) {
      return res.status(404).json({
        error: 'Next FIFO Id Not Provided',
      });
    }

    if (existingFifo.orderedItems.length > 0 && Number(nextFifoId) > 0) {
      const updatedItemIds = existingFifo.orderedItems.map((item: any) => {
        return item.id;
      });

      const nextFifo = await prisma.fifo.findUnique({
        where: {
          id: Number(nextFifoId),
        },
      });

      if (!nextFifo) {
        return res.status(404).json({
          error: 'Next FIFO Not Found And Cannot Shift Ordered Items',
        });
      }

      // If FIFO has ordered items, shift all ordered items to the next earliest FIFO
      await prisma.orderedItems.updateMany({
        where: {
          id: {
            in: updatedItemIds,
          },
        },
        data: {
          fifoId: nextFifo.id,
        },
      });
    }

    // Delete FIFO
    await prisma.fifo.delete({
      where: {
        id: Number(id),
      },
    });

    return res.status(200).json({
      message: 'FIFO Deleted Successfully',
    });
  } catch (error: any) {
    console.log('Internal Server Error: ', error);
    return res.status(500).json({
      error: 'Internal Server Error: ' + error,
    });
  }
}
