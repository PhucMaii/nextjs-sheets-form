import { PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';
import { getUserInfo } from '../../utils/auth';

interface IBody {
  updatedData: any;
  methodId: number;
  updatedAt: string;
}

export default async function PUT(req: NextApiRequest, res: NextApiResponse) {
  try {
    const prisma = new PrismaClient();

    const user: any = await getUserInfo(req, res);

    const { updatedData, methodId, updatedAt }: IBody = req.body;

    const existingMethod = await prisma.paymentMethod.findUnique({
      where: {
        id: methodId,
      },
    });

    if (!existingMethod) {
      return res.status(404).json({
        error: 'Payment Method Not Found',
      });
    }

    // Handle check name change
    if (updatedData.name && updatedData.name !== existingMethod.name) {
      const sameMethodName = await prisma.paymentMethod.findFirst({
        where: {
          name: updatedData.name,
        },
      });

      if (sameMethodName) {
        return res.status(400).json({
          error: 'Payment Method Name Existed Already',
        });
      }
    }

    const updatedMethod = await prisma.paymentMethod.update({
      where: {
        id: methodId,
      },
      data: {
        ...updatedData,
        updatedAt,
        updatedBy: `Admin - ${user.clientName}`,
      },
      include: {
        transactions: true,
      },
    });

    return res.status(200).json({
      data: updatedMethod,
      message: 'Payment Method Updated Successfully',
    });
  } catch (error: any) {
    console.log('Internal Server Error: ', error);
    return res.status(500).json({
      error: 'Internal Server Error: ' + error,
    });
  }
}
