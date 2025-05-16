import { PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';
import { getTodayDate } from '../../../utils/date';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/pages/api/auth/[...nextauth]';

interface IBody {
  month: string;
  clientIds: number[];
  isPrinted: boolean;
}

export default async function PUT(req: NextApiRequest, res: NextApiResponse) {
  try {
    const prisma = new PrismaClient();

    const { companyId } = req.query;

    if (!companyId) {
      return res.status(404).json({
        error: 'Parameters are missing',
      });
    }

    const { month, clientIds, isPrinted }: IBody = req.body;

    if (!month || !clientIds) {
      return res.status(404).json({
        error: 'You are missing body data',
      });
    }

    const existingClientStatements = await prisma.clientStatement.findMany({
      where: {
        month,
        userId: {
          in: clientIds,
        },
        companyId: Number(companyId),
      },
    });

    const session: any = await getServerSession(req, res, authOptions);
    const admin: any = session?.user;
    const createdBy = `Admin - ${admin.name}`;
    const { date, time } = getTodayDate();

    const nonExistentClientStatements = clientIds
      .filter(
        (clientId: number) =>
          !existingClientStatements.find(
            (clientStatement) => clientStatement.userId === clientId,
          ),
      )
      .map((clientId: number) => ({
        month,
        userId: clientId,
        isPrinted,
        printedBy: createdBy,
        createdAt: `${date} ${time}`,
        companyId: Number(companyId),
      }));

    // Update existing client statements
    if (existingClientStatements.length > 0) {
      await prisma.clientStatement.updateMany({
        where: {
          month,
          id: {
            in: existingClientStatements.map(
              (clientStatement) => clientStatement.id,
            ),
          },
          companyId: Number(companyId),
        },
        data: {
          isPrinted,
          updatedBy: createdBy,
        },
      });
    }

    // Create new client statements
    await prisma.clientStatement.createMany({
      data: nonExistentClientStatements,
    });

    return res.status(200).json({
      message: 'Client Statements Updated Successfully',
    });
  } catch (error: any) {
    console.log('Internal Server Error: ', error);
    return res.status(500).json({
      error: 'Internal Server Error: ' + error,
    });
  }
}
