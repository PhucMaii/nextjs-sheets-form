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
        error: 'Vendor Id Not Provided',
      });
    }

    const existingVendor = await prisma.vendor.findUnique({
      where: {
        id: Number(id),
      },
    });

    if (!existingVendor) {
      return res.status(404).json({
        error: 'Vendor Not Found',
      });
    }

    await prisma.vendor.delete({
      where: {
        id: existingVendor.id,
      },
    });

    return res.status(200).json({
      message: 'Vendor Deleted Successfully',
    });
  } catch (error: any) {
    console.log('Internal Server Error: ', error);
    return res.status(500).json({
      error: 'Internal Server Error: ' + error,
    });
  }
}
