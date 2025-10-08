import axios from 'axios';
import { NextApiRequest, NextApiResponse } from 'next';
import withAdminAuthGuard from '@/pages/api/utils/withAdminAuthGuard';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const { data } = await axios.get(
      'https://api.hydrawise.com/api/v1/statusschedule.php',
      { params: { api_key: process.env.HYDRAWISE_API_KEY } },
    );

    return res.status(200).json({ data: data.relays });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: 'Internal Server Error: ' + error });
  }
};

export default withAdminAuthGuard(handler);
