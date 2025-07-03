import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/client';

export default async function GET(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { employeeId, companyId } = req.query;

    if (employeeId) {
      const employee = await prisma.employee.findUnique({
        where: { id: Number(employeeId) },
        include: {
          adminPages: {
            include: {
              pageView: true,
            }
          },
        },
      });

      return res.status(200).json({ data: employee });
    }

    if (companyId) {
      const employees = await prisma.employee.findMany({
        where: { companyId: Number(companyId) },
        include: {
          adminPages: {
            include: {
              pageView: true,
            }
          },
        },
      });

      return res.status(200).json({ data: employees });
    }

    return res.status(200).json({ data: [] });
  } catch (error) {
    console.error('Internal server error: ', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
