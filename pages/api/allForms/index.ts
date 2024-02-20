import { PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';
import withAuthGuard from '../utils/withAuthGuard';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const prisma = new PrismaClient();
  try {
    if (req.method !== 'GET') {
      return res.status(400).send('Only GET method allowed');
    }
    const userId = req.query.userId as string;
    const data = await prisma.form.findMany({
      where: {
        userId: Number(userId),
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
};

export default withAuthGuard(handler);
