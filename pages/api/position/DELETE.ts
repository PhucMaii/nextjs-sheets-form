import { PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function DELETEMethod(
  req: NextApiRequest,
  res: NextApiResponse,
  prisma: PrismaClient,
) {
  try {
    const posId = req.query.positionId as string;

    const deletedPos = await prisma.position.findUnique({
      where: {
        positionId: Number(posId),
      },
    });

    if (!deletedPos) {
      return res.status(404).json({ error: 'Position Id Not Found' });
    }

    await prisma.position.delete({
      where: {
        positionId: Number(posId),
      },
    });

    return res.status(200).json({
      message: 'Position Deleted Succesfully',
    });
  } catch (error) {
    console.log('Fail to add position', error);
    return res.status(500).send('Fail to add position ' + error);
  }
}
