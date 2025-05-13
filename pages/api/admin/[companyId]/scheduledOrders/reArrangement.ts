// import { ScheduledOrder } from '@/app/utils/type';
import { PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';

interface BodyTypes {
  removedPositionIndexIdList: number[];
  newPositionIndexList: { index: number; scheduledOrderId: number }[];
}

export default async function reArrangement(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  try {
    const prisma = new PrismaClient();

    const { removedPositionIndexIdList, newPositionIndexList }: BodyTypes =
      req.body;

    // const updatedOrders = await prisma.positionIndex.findMany({
    //   where: {
    //     id: {
    //       in: removedPositionIndexIdList,
    //     },
    //   },
    //   include: {
    //     items: true,
    //   },
    // });

    // Remove all the positionIndex provided from client - it should all in selected route by client
    await prisma.positionIndex.deleteMany({
      where: {
        id: {
          in: removedPositionIndexIdList,
        },
      },
    });

    // Create new position index list provided from client
    await prisma.positionIndex.createMany({
      data: newPositionIndexList,
    });

    const updatedScheduledOrders = await prisma.scheduleOrders.findMany({
      where: {
        id: {
          in: newPositionIndexList.map((posIndex) => posIndex.scheduledOrderId),
        },
      },
    });

    return res.status(200).json({
      data: updatedScheduledOrders,
      message: 'Rearrange Successfully',
    });
  } catch (error: any) {
    console.log('Internal Server Error: ', error);
    return res.status(500).json({
      error: 'Internal Server Error: ' + error,
    });
  }
}
