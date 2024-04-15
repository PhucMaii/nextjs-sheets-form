import { NextApiRequest, NextApiResponse } from 'next';
import GET from './GET';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  try {
    if (req.method === 'GET') {
      const response = await GET(req, res);
      return response;
    }

    return res.status(401).json({
      error: 'Your method is not supported',
    });
  } catch (error: any) {
    console.log('Internal Server Error: ' + error);
    return res.status(500).json({
      message: 'Internal Server Error: ' + error,
    });
  }
}
