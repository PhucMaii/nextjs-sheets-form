import { NextApiRequest, NextApiResponse } from 'next';
import POST from './POST';
import GET from './GET';
import PUT from './PUT';
import DELETE from './DELETE';
import withEmployeeAuthGuard from '@/pages/api/utils/withEmployeeAuthGuard';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    if (req.method === 'POST') {
      const response = await POST(req, res);
      return response;
    }

    if (req.method === 'GET') {
      const response = await GET(req, res);
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

    return res.status(404).json({
      error: 'Your method is not supported',
    });
  } catch (error: any) {
    console.log('Internal Server Error: ', error);
  }
};

export default withEmployeeAuthGuard(handler);
