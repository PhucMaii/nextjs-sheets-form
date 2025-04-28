import withAdminAuthGuard from '@/pages/api/utils/withAdminAuthGuard';
import { PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';

interface IBody {
  id: number;
  visibility: boolean;
}

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    if (req.method !== 'PUT') {
      return res.status(404).json({ error: 'Your method is not supported' });
    }

    const prisma = new PrismaClient();

    const { id, visibility }: IBody = req.body;

    const existingPromotion = await prisma.promotion.findUnique({
      where: {
        id,
        isWebsite: null,
      },
    });

    if (!existingPromotion) {
      return res.status(404).json({ error: 'Promotion Not Found' });
    }

    await prisma.promotion.update({
      where: {
        id,
      },
      data: {
        visibility,
      },
    });

    return res.status(200).json({ message: 'Promotion Updated Successfully' });
  } catch (error: any) {
    console.log('Internal Server Error: ', error);
    return res.status(500).json({ error: 'Internal Server Error: ' + error });
  }
};

export default withAdminAuthGuard(handler);
