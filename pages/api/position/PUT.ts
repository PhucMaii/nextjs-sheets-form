import { PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';
import checkPositionUpdate from '../utils/checkPositionUpdate';
import { PositionType } from '@/app/utils/type';

export default async function PUTMethod(
  req: NextApiRequest,
  res: NextApiResponse,
  prisma: PrismaClient,
) {
  try {
    const body: PositionType = req.body;
    const isValidToUpdate = await checkPositionUpdate(prisma, body);
    if (!isValidToUpdate) {
      return res.status(400).json({ error: 'The updated position existed' });
    }
    const updatePosition = await prisma.position.update({
      where: {
        positionId: body.positionId,
      },
      data: {
        sheetName: body.sheetName,
        row: body.row,
      },
    });

    return res.status(200).json({
      data: updatePosition,
      message: `Position Updated Successfully`,
    });
  } catch (error) {
    console.log(error, 'UPdate error');
    return res
      .status(500)
      .json({ error: 'Internal Sever Error with Update Method ' + error });
  }
}
