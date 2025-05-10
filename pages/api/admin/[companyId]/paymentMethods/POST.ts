import { PAYMENT_METHOD_TYPE } from '@/app/utils/enum';
import { PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/pages/api/auth/[...nextauth]';

interface IBody {
  name: string;
  type: PAYMENT_METHOD_TYPE;
  createdAt: string;
  createdBy: string;
  balance: number;
}

export default async function POST(req: NextApiRequest, res: NextApiResponse) {
  try {
    const prisma = new PrismaClient();

    const { name, type, createdAt, balance }: IBody = req.body;

    const existingMethodName = await prisma.paymentMethod.findFirst({
      where: {
        name,
      },
    });

    if (existingMethodName) {
      return res.status(400).json({
        error: 'Payment Method Name Existed Already',
      });
    }

    const session: any = await getServerSession(req, res, authOptions);

    if (!session) {
      return res.status(401).json({
        error: 'Unauthorized',
      });
    }

    const adminUser = await prisma.user.findUnique({
      where: {
        id: Number(session?.user?.id),
      },
    });

    if (!adminUser) {
      return res.status(401).json({
        error: 'Unauthorized',
      });
    }

    const newPaymentMethod = await prisma.paymentMethod.create({
      data: {
        name,
        type,
        createdAt,
        createdBy: `Admin - ${adminUser.clientName}`,
        balance,
      },
    });

    return res.status(201).json({
      data: newPaymentMethod,
      message: 'Create New Payment Method Successfully',
    });
  } catch (error: any) {
    console.log('Internal Server Error: ', error);
    return res.status(500).json({ error: 'Internal Server Error: ' + error });
  }
}
