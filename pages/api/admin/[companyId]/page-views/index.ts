import { NextApiRequest, NextApiResponse } from 'next';
import GET from './GET';
import withAdminAuthGuard from '@/pages/api/utils/withAdminAuthGuard';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    if (req.method === 'GET') {
      return GET(req, res);
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Internal server error: ', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export default withAdminAuthGuard(handler);