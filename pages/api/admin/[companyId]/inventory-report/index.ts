import { NextApiRequest, NextApiResponse } from 'next';
import GET from './GET';
import POST from './POST';
import withAdminAuthGuard from '@/pages/api/utils/withAdminAuthGuard';
import DELETE from './DELETE';

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
    if (req.method === 'DELETE') {
      const response = await DELETE(req, res);
      return response;
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error: any) {
    console.log('Something went wrong while handling inventory report', error);
    return res
      .status(500)
      .json({ error: 'Something went wrong while handling inventory report' });
  }
};

export default withAdminAuthGuard(handler);
