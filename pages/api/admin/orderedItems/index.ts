import { NextApiRequest, NextApiResponse } from 'next';
import GET from './GET';
import withAdminAuthGuard from '../../utils/withAdminAuthGuard';
import PUT from './PUT';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    if (req.method === 'GET') {
      const response = await GET(req, res);
      return response;
    }

    if (req.method === 'PUT') {
      const response = await PUT(req, res);
      return response;
    }

    return res.status(404).json({ error: 'Your method is not supported' });
  } catch (error) {
    console.log('Internal Server Error: ', error);
  }
};

export default withAdminAuthGuard(handler);
