import { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

export default async function POST(req: NextApiRequest, res: NextApiResponse) {
  try {
    const body = req.body as any;
    const requests = body.orders.map(async (order: any) => {
      const response = await axios.post(
        'https://www.supremesprouts.com/api/import-sheets',
        order,
      );
      if (response.data.error) {
        return { success: false, error: response.data.error };
      }
      return { success: true };
    });

    const responses = await Promise.all(requests);
    const failedRequests = responses.filter((response) => !response.success);

    if (failedRequests.length > 0) {
      console.log('Some requests failed: ', failedRequests);
      return res.status(500).json({
        error: 'Some requests failed',
        failedRequests,
      });
    }

    return res.status(200).json({
      message: 'Create Multiple Orders Successfully',
    });
  } catch (error: any) {
    console.log('Internal Server Error: ', error);
    return res.status(500).json({
      error: 'Internal Server Error: ' + error.message,
    });
  }
}
