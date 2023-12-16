import { PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';

interface RequestQuery {
  formId?: string;
}
export default async function DELETEMethod(
  req: NextApiRequest,
  res: NextApiResponse,
  prisma: PrismaClient,
) {
  try {
    const { formId }: RequestQuery = req.query;
    if (!formId) {
      return res.status(400).send('Missing form id');
    }
    const deletedData = await prisma.form.delete({
      where: {
        formId: Number(formId),
      },
    });
    return res.status(200).json({
      data: deletedData,
      message: `Delete ${deletedData.formName} form successfully`,
    });
  } catch (error) {
    return res.status(500).send('There was something wrong ' + error);
  }
}
