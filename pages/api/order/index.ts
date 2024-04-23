import { NextApiRequest, NextApiResponse } from 'next';
import withAuthGuard from '../utils/withAuthGuard';
import PUT from './PUT';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    if (req.method === 'PUT') {
      const response = await PUT(req, res);
      return response;
    }

    return res.status(404).json({
      error: 'Your method is not supported',
    });
  } catch (error: any) {
    console.log('Internal Server Error: ', error);
    return res.status(500).json({
      error: 'Internal Server Error: ' + error,
    });
  }
};

export default withAuthGuard(handler);
