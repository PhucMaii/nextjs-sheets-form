import { PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';

interface PositionType {
  formId: number;
  sheetName: string;
  row: number;
}

export default async function POSTMEthod(
  req: NextApiRequest,
  res: NextApiResponse,
  prisma: PrismaClient,
) {
  try {
    const { formId, sheetName, row }: PositionType = req.body;

    if (!sheetName || !row) {
      return res.status(400).send('Missing either sheet name or row');
    }

    const newPos = await prisma.position.create({
      data: {
        formId,
        sheetName,
        row,
      },
    });

    return res.status(201).json({
      data: newPos,
      message: 'Position Created Successfully',
    });
  } catch (error) {
    console.log('Fail to add position', error);
    return res.status(500).send('Fail to add position ' + error);
  }
}
