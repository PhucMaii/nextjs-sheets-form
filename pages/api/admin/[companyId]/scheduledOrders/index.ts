import { NextApiRequest, NextApiResponse } from 'next';
import GET from './GET';
import POST from './POST';
import PUT from './PUT';
import withAdminAuthGuard from '../../utils/withAdminAuthGuard';
import DELETE from './DELETE';
import reArrangement from './reArrangement';

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
      if (req.body.reArrangement) {
        const reArrangementResponse = await reArrangement(req, res);
        return reArrangementResponse;
      }
      const response = await PUT(req, res);
      return response;
    }

    if (req.method === 'DELETE') {
      const response = await DELETE(req, res);
      return response;
    }

    return res.status(500).json({
      error: 'Your method is not supported',
    });
  } catch (error: any) {
    console.log('Internal Server Error: ', error);
    return res.status(500).json({
      error: 'Internal Server Error: ' + error,
    });
  }
};

export default withAdminAuthGuard(handler);
