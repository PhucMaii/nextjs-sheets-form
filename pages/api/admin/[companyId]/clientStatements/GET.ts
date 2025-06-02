import { USER_CATEGORIZED } from '@/app/utils/enum';
import { PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';

interface IQuery {
  month?: string;
}

export default async function GET(req: NextApiRequest, res: NextApiResponse) {
  try {
    const prisma = new PrismaClient();

    const { month }: IQuery = req.query;
    const { companyId } = req.query;

    if (!month) {
      return res.status(404).json({
        error: 'You are missing body data',
      });
    }

    const clientStatements = await prisma.clientStatement.findMany({
      where: {
        month,
        companyId: Number(companyId),
        user: {
          type: {
            not: USER_CATEGORIZED.INACTIVE
          }
        }
      },
    });

    return res.status(200).json({
      data: clientStatements,
    });
  } catch (error: any) {
    console.log('Internal Server Error: ', error);
    return res.status(500).json({
      error: 'Internal Server Error: ' + error,
    });
  }
}
