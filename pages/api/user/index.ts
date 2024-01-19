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
  } catch (error) {
    console.log('Internal Server Error');
    return res.status(500).json({
      error: 'Internal Server Error',
    });
  }
}
