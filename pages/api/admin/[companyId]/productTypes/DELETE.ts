import { PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';

interface IQuery {
  id?: string;
}

export default async function DELETE(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  try {
    const prisma = new PrismaClient();

    const { id }: IQuery = req.query;

    if (!id) {
      return res.status(404).json({
        error: 'Product Type Id Not Provided',
      });
    }

    const existingProductType = await prisma.itemType.findUnique({
      where: {
        id: Number(id),
      },
    });

    if (!existingProductType) {
      return res.status(404).json({
        error: 'Product Type Not Found',
      });
    }

    await prisma.itemType.delete({
      where: {
        id: Number(id),
      },
    });

    return res.status(200).json({
      message: 'Product Type Deleted Successfully',
    });
  } catch (error: any) {
    console.log('Internal Server Error: ', error);
    return res.status(500).json({
      error: 'Internal Server Error: ' + error,
    });
  }
}
