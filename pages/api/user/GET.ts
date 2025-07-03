import { NextApiRequest, NextApiResponse } from 'next';
import withAuthGuard from '../utils/withAuthGuard';
import prisma from '@/client';

const GET = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const userId: string = req.query.id as any;
    const role: string = req.query.role as any;

    // console.log({role, compare: role == undefined}, 'role')

    if (!role || role === 'undefined' || role === 'client') {
      const existingUser = await prisma.user.findUnique({
        where: {
          id: parseInt(userId),
        },
        include: {
          Orders: true,
          company: true,
        },
      });

      return res.status(200).json({
        data: existingUser,
        message: 'Fetch User Successfully',
      });
    }

    // If no user found, find employee
    if (role !== 'client') {
      const existingEmployee = await prisma.employee.findUnique({
        where: {
          id: parseInt(userId),
        },
        include: {
          adminPages: true,
          company: true,
        }
      });

      if (!existingEmployee) {
        return res.status(404).json({ error: 'User Not Found' });
      }

      return res.status(200).json({
        data: existingEmployee,
        message: 'Fetch User Successfully',
      });
    }

    return res.status(404).json({ error: 'User Not Found' });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      error: 'Internal Server Occur in GET USER request' + error,
    });
  }
};

export default withAuthGuard(GET);
