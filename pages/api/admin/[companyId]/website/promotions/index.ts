import withAdminAuthGuard from '@/pages/api/utils/withAdminAuthGuard';
import { NextApiResponse } from 'next';

import { NextApiRequest } from 'next';
import POST from './POST';
import GET from './GET';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    if (req.method === 'GET') {
      const response = await GET(req, res);
      return response;
    }

    if (req.method === 'POST') {
      const response = await POST(req, res);
      return response;
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Internal server error', error);
    return res.status(500).json({ error: 'Internal server error: ' + error });
  }
};

export default withAdminAuthGuard(handler);
