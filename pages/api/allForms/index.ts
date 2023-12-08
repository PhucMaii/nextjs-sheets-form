import { PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';

interface RequestQuery {
    userId?: string
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const prisma = new PrismaClient();
  try {
    if (req.method !== 'GET') {
      return res.status(400).send('Only GET method allowed');
    }
    const { userId }: RequestQuery = req.query;
    if (!userId) {
      return res.status(400).send('User Id Not Found');
    }
    const data = await prisma.form.findMany({
      where: {
        user_id: Number(userId),
      },
    });
    return res.status(200).json({
      data,
      message: 'Form Fetched Successfully',
    });
  } catch (error) {
    console.error('Error in form retrieval:', error);
    return res.status(500).send('There was something wrong ' + error);
  }
}
