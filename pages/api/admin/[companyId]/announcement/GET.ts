import { PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function GET(req: NextApiRequest, res: NextApiResponse) {
  try {
    const prisma = new PrismaClient();

    const { companyId }: any = req.query;

    const announcement = await prisma.announcement.findFirst({
      where: {
        companyId,
      },
    });

    return res.status(200).json({
      data: announcement,
      message: 'Fetch Announcement Successfully',
    });
  } catch (error: any) {
    console.log('Internal Server Error: ', error);
    return res.status(500).json({
      error: 'Internal Server Error: ' + error,
    });
  }
}
