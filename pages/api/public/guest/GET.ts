import { USER_ROLE } from '@/app/utils/enum';
import { PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function GET(req: NextApiRequest, res: NextApiResponse) {
  try {
    const prisma = new PrismaClient();

    const { guestSessionId } = req.query;

    if (!guestSessionId) {
      return res.status(404).json({
        error: 'You are missing body data',
      });
    }

    const guest = await prisma.user.findFirst({
      where: {
        guestSessionId: guestSessionId as string,
        role: USER_ROLE.GUEST,
      },
    });

    return res.status(200).json({
      data: guest,
      message: 'Fetch Guest Successfully',
    });
  } catch (error: any) {
    console.log('Internal Server Error: ', error);
    return res.status(500).json({
      error: 'Internal Server Error: ' + error,
    });
  }
}
