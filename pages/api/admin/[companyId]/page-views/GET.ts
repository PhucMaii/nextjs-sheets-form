import prisma from '@/client';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function GET(req: NextApiRequest, res: NextApiResponse) {
  try {
    const pageViews = await prisma.pageView.findMany({});

    return res.status(200).json({ data: pageViews });
  } catch (error) {
    console.error('Internal server error: ', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}