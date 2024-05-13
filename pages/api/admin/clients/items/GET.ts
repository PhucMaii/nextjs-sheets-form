import { PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';

interface RequestQuery {
  categoryId?: string;
}

export default async function GET(req: NextApiRequest, res: NextApiResponse) {
  try {
    const prisma = new PrismaClient();
    const { categoryId } = req.query as RequestQuery;

    const clientItems = await prisma.item.findMany({
      where: {
        categoryId: Number(categoryId),
      },
    });

    return res.status(200).json({
      data: clientItems,
      message: 'Fetch Items For Specific Client Successfully',
    });
  } catch (error: any) {
    console.log('Internal Server Error: ' + error);
    return res.status(500).json({
      error: 'Internal Server Error: ' + error,
    });
  }
}
