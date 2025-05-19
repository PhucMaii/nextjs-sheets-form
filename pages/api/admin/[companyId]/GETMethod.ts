import { USER_ROLE } from '@/app/utils/enum';
import { PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function GET(req: NextApiRequest, res: NextApiResponse) {
  try {
    const prisma = new PrismaClient();

    const admins = await prisma.user.findMany({
      where: {
        role: {
          in: [USER_ROLE.ADMIN, USER_ROLE.SUPER_ADMIN],
        },
      },
    });

    return res.status(200).json({
      data: admins,
      message: 'Fetch Admins Successfully',
    });
  } catch (error: any) {
    console.log('Internal Server Error: ', error);
    return res.status(500).json({ error: 'Internal Server Error: ' + error });
  }
}
