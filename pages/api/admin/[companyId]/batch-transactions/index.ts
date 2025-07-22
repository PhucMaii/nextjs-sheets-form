import { NextApiRequest, NextApiResponse } from 'next';
import POST from './POST';
import withAdminAuthGuard from '@/pages/api/utils/withAdminAuthGuard';
import DELETE from './DELETE';
import PUT from './PUT';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    if (req.method === 'POST') {
      return POST(req, res);
    }

    if (req.method === 'DELETE') {
      return DELETE(req, res);
    }

    if (req.method === 'PUT') {
      return PUT(req, res);
    }

    return res.status(404).json({ error: 'Method not allowed' });
  } catch (error) {
    console.log('Internal Server Error: ', error);
    res.status(500).json({ error: 'Fail to get batch transactions: ' + error });
  }
};

export default withAdminAuthGuard(handler);
