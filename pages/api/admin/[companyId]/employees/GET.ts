import { PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';

const prisma = new PrismaClient();

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
      
      if (employee?.isDeleted) {
        return res.status(404).json({ error: 'Employee not found' });
      }

      return res.status(200).json({ data: employee });
    }

    if (companyId) {
      const employees = await prisma.employee.findMany({
        where: {
          companyId: Number(companyId),
          OR: [
            {
              isDeleted: false,
            },
            {
              isDeleted: null,
            },
          ],
        },
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
