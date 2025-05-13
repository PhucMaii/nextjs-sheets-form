import { PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';

interface IBody {
  announcementId: number;
  announcement: string;
  updatedBy: string;
  updatedAt: Date;
}

export default async function PUT(req: NextApiRequest, res: NextApiResponse) {
  try {
    const prisma = new PrismaClient();

    const { companyId }: any = req.query;

    const {
      announcementId,
      announcement = '',
      updatedBy,
      updatedAt,
    }: IBody = req.body;

    if (!updatedBy || !updatedAt) {
      return res.status(404).json({
        error: 'You are missing body data',
      });
    }

    const existingAnnouncement = await prisma.announcement.findUnique({
      where: {
        id: announcementId,
        companyId: Number(companyId),
      },
    });

    if (!existingAnnouncement) {
      return res.status(404).json({
        error: 'Announcement Not Found',
      });
    }

    const updatedAnnouncement = await prisma.announcement.update({
      where: {
        id: existingAnnouncement.id,
      },
      data: {
        announcement,
        updatedBy,
        updatedAt,
      },
    });

    return res.status(200).json({
      data: updatedAnnouncement,
      message: 'Update Announcement Successfully',
    });
  } catch (error: any) {
    console.log('Internal Server Error: ', error);
    return res.status(500).json({
      error: 'Internal Server Error: ' + error,
    });
  }
}
