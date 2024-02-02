import { PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';
import POSTMEthod from './POST';
import PUTMethod from './PUT';
import DELETEMethod from './DELETE';
import withAuthGuard from '../utils/withAuthGuard';

const handler = async (
  req: NextApiRequest,
  res: NextApiResponse,
) => {
  const prisma = new PrismaClient();
  try {
    if (req.method === 'PUT') {
      const response = await PUTMethod(req, res, prisma);
      return response;
    }

    if (req.method === 'POST') {
      const response = await POSTMEthod(req, res, prisma);
      return response;
    }

    if (req.method === 'DELETE') {
      const response = await DELETEMethod(req, res, prisma);
      return response;
    }
  } catch (error) {
    return res.status(500).send('There was an error ' + error);
  }
}

export default withAuthGuard(handler);