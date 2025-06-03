import withAdminAuthGuard from '@/pages/api/utils/withAdminAuthGuard';
import { NextApiRequest, NextApiResponse } from 'next';
import GET from './GET';
import POST from './POST';
import PUT from './PUT';
import DELETE from './DELETE';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    if (req.method === 'GET') {
      return GET(req, res);
    }

    if (req.method === 'POST') {
      return POST(req, res);
    }

    if (req.method === 'PUT') {
      return PUT(req, res);
    }

    if (req.method === 'DELETE') {
      return DELETE(req, res);
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: 'Internal Server Error: ' + error });
  }
};

export default withAdminAuthGuard(handler);