import { PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';
import { POSTMethod } from './POST';
import { GETMethod } from './GET';
import DELETEMethod from './DELETE';
import PUTMethod from './PUT';
import withAuthGuard from '../utils/withAuthGuard';

const handler = async (
  req: NextApiRequest,
  res: NextApiResponse,
) => {
  const prisma = new PrismaClient();
  try {
    if (req.method === 'POST') {
      const response = await POSTMethod(req, res, prisma);
      return response;
    }
    if (req.method === 'GET') {
      const response = await GETMethod(req, res, prisma);
      return response;
    }
    if (req.method === 'DELETE') {
      const response = await DELETEMethod(req, res, prisma);
      return response;
    }
    if (req.method === 'PUT') {
      const response = await PUTMethod(req, res, prisma);
      return response;
    }
    return res.status(500).send(`${req.method} is not allowed`);
  } finally {
    await prisma.$disconnect();
  }
}

export default withAuthGuard(handler);