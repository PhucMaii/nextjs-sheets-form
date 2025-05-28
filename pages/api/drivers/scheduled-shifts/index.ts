import { NextApiRequest, NextApiResponse } from "next";
import GET from "./GET";
import withEmployeeAuthGuard from "../../utils/withEmployeeAuthGuard";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    try {
        if (req.method === 'GET') {
            return GET(req, res);
        }
    } catch (error: any) {
    console.log('Internal server error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export default withEmployeeAuthGuard(handler);