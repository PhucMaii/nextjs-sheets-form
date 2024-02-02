import { PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function DELETEMethod(
  req: NextApiRequest,
  res: NextApiResponse,
  prisma: PrismaClient,
) {
  try {
    const { inputId } = req.query as { inputId: string };
    const deleteInput = await prisma.input.delete({
      where: {
        inputId: Number(inputId),
      },
    });
    return res.status(200).json({
      data: deleteInput,
      message: 'Delete Input Successfully',
    });
  } catch (error) {
    console.log('Fail to delete input, ', error);
    return res.status(500).send('Fail to delete input, ' + error);
  }
}
