import { NextApiRequest, NextApiResponse } from 'next';
import POST from './POST';
import withAdminAuthGuard from '../../utils/withAdminAuthGuard';
import GET from './GET';
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
  } catch (error: any) {
    console.log('Internal Server Error', error);
    return res.status(500).json({ error: 'Internal Server Error: ' + error });
  }
};

export default withAdminAuthGuard(handler);
