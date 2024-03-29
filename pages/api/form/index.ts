import { PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';
import { GETMethod } from './GET';
// import withAuthGuard from '../utils/withAuthGuard';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const prisma = new PrismaClient();
  try {
    if (req.method === 'GET') {
      const response = await GETMethod(req, res, prisma);
      return response;
    }
    return res.status(500).send(`${req.method} is not allowed`);
  } finally {
    await prisma.$disconnect();
  }
};

export default handler;
