import { NextApiRequest, NextApiResponse } from 'next';
import GET from './GET';
import PUT from './PUT';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    if (req.method === 'GET') {
      const response = await GET(req, res);
      return response;
    }

    if (req.method === 'PUT') {
      const response = await PUT(req, res);
      return response;
    }
  } catch (error) {
    console.log('Internal Server Error');
    return res.status(500).json({
      error: 'Internal Server Error',
    });
  }
};

export default handler;
