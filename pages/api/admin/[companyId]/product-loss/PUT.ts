import { IProductLoss } from '@/app/utils/type';
import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/client';

interface IBody {
  id: number;
  updatedProductLoss: IProductLoss;
}

export default async function PUT(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { id, updatedProductLoss } = req.body as IBody;

    const existingProductLoss = await prisma.lossReport.findUnique({
      where: {
        id: id,
      },
    });

    if (!existingProductLoss) {
      return res.status(404).json({
        error: 'Product loss not found',
      });
    }

    await prisma.lossReport.update({
      where: {
        id: id,
      },
      data: {
        quantityLost: updatedProductLoss.quantityLost,
        lossType: updatedProductLoss.lossType,
        description: updatedProductLoss.description,
        reportedBy: updatedProductLoss.reportedBy,
        reportedDate: updatedProductLoss.reportedDate,
      },
    });

    return res.status(200).json({
      message: 'Product loss updated successfully',
      data: updatedProductLoss,
    });
  } catch (error: any) {
    console.log('Internal Server Error: ', error);
    return res.status(500).json({
      error: 'Internal Server Error: ' + error,
    });
  }
}
