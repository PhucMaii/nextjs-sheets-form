import { NextApiRequest, NextApiResponse } from 'next';
import GET from './GET';
import POST from './POST';
import PUT from './PUT';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
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

    return res.status(500).json({
      error: 'Your method is not supported',
    });
  } catch (error: any) {
    console.log('Internal Server Error: ', error);
    return res.status(500).json({
      error: 'Internal Server Error: ' + error,
    });
  }
}
