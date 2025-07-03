import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import prisma from '@/client';

interface IBody {
  updatedData: any;
  methodId: number;
  updatedAt: string;
}

export default async function PUT(req: NextApiRequest, res: NextApiResponse) {
  try {
    const session: any = await getServerSession(req, res, authOptions);
    const user: any = session?.user;

    const { updatedData, methodId, updatedAt }: IBody = req.body;

    const { companyId } = req.query;

    if (!companyId) {
      return res.status(400).json({
        error: 'Company ID is required',
      });
    }

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
          companyId: Number(companyId),
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
        updatedBy: `Admin - ${user.name}`,
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
