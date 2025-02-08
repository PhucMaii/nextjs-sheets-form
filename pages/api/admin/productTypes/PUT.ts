import { PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';

interface IBody {
  id: number;
  name: string;
  icon: string;
}

export default async function PUT(req: NextApiRequest, res: NextApiResponse) {
  try {
    const prisma = new PrismaClient();

    const { id, name, icon }: IBody = req.body;

    const existingProductType = await prisma.itemType.findUnique({
      where: {
        id,
      },
    });

    if (!existingProductType) {
      return res.status(404).json({
        error: 'Product Type Not Found',
      });
    }

    // if (existingProductType.name === name) {
    //   return res.status(400).json({
    //     error: 'New Name Does Not Change',
    //   });
    // }

    const sameNameProductType = await prisma.itemType.findFirst({
      where: {
        name,
        icon,
      },
    });

    if (sameNameProductType) {
      return res.status(400).json({
        error: 'Please Update At Least 1 Field',
      });
    }

    await prisma.itemType.update({
      where: {
        id,
      },
      data: {
        name,
        icon,
      },
    });

    return res.status(200).json({
      message: 'Product Type Updated Successfully',
    });
  } catch (error: any) {
    console.log('Internal Server Error: ', error);
    return res.status(500).json({
      error: 'Internal Server Error: ' + error,
    });
  }
}
