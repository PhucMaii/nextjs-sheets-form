import { NextApiRequest, NextApiResponse } from 'next';
import GET from './GET';
import withAdminAuthGuard from '../../utils/withAdminAuthGuard';
import PUT from './PUT';
import DELETE from './DELETE';
import MultipleUpdate from './multipleUpdate';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    if (req.method === 'GET') {
      const response = await GET(req, res);
      return response;
    }

    if (req.method === 'PUT') {
      const { clientList } = req.body;

      if (clientList) {
        const response = await MultipleUpdate(req, res);
        return response;
      } else {
        const response = await PUT(req, res);
        return response;
      }
    }

    if (req.method === 'DELETE') {
      const response = await DELETE(req, res);
      return response;
    }

    return res.status(401).json({
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
