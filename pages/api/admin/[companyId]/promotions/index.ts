import { NextApiRequest, NextApiResponse } from 'next';
import withAdminAuthGuard from '@/pages/api/utils/withAdminAuthGuard';
import GET from './GET';
import POST from './POST';
import PUT from './PUT';
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

    if (req.method === 'PUT') {
      const response = await PUT(req, res);
      return response;
    }

    if (req.method === 'DELETE') {
      const response = await DELETE(req, res);
      return response;
    }

    return res.status(404).json({ error: 'Your method is not supported' });
  } catch (error: any) {
    console.log('There was an error: ', error);
    return res.status(500).json({ error: 'Internal Server Error: ' + error });
  }
};

export default withAdminAuthGuard(handler);
