import { NextApiRequest, NextApiResponse } from 'next';
import GET from './GET';
import PUT from './PUT';
import POST from './POST';
import withAdminAuthGuard from '@/pages/api/utils/withAdminAuthGuard';

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

    if (req.method === 'PUT') {
      const response = await PUT(req, res);
      return response;
    }

    return res.status(500).json({
      error: 'Method is not supported',
    });
  } catch (error: any) {
    console.log('Fail in order api: ', error);
    return res.status(500).json({
      error: 'Fail in order api: ' + error,
    });
  }
};

export default withAdminAuthGuard(handler);
