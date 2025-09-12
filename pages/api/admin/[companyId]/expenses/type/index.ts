import { NextApiRequest, NextApiResponse } from 'next';
import POST from './POST';
import PUT from './PUT';
import DELETE from './DELETE';
import GET from './GET';
import withAdminAuthGuard from '@/pages/api/utils/withAdminAuthGuard';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
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
};

export default withAdminAuthGuard(handler);
