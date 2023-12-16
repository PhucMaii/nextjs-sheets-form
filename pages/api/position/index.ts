import { PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';
import PUTMethod from './PUT';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const prisma = new PrismaClient();
  try {
    if (req.method === 'PUT') {
      const response = await PUTMethod(req, res, prisma);
      return response;
    }
  } catch (error) {
    return res.status(500).send('There was an error ' + error);
  }
}
