import { NextApiRequest, NextApiResponse } from 'next';
import POST from './POST';
import withAdminAuthGuard from '@/pages/api/utils/withAdminAuthGuard';
import GET from './GET';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    if (req.method === 'GET') {
      return GET(req, res);
    }

    if (req.method === 'POST') {
      return POST(req, res);
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: 'Something went wrong' });
  }
};

export default withAdminAuthGuard(handler);
