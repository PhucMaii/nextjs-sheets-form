import { NextApiRequest, NextApiResponse } from "next";
import GET from "./GET";
import withAuthGuard from "@/pages/api/utils/withAuthGuard";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    try {
        if (req.method === 'GET') {
            const response = await GET(req, res);
            return response;
        }

        return res.status(405).json({
            message: 'Method not allowed',
        });
    } catch (error) {
        console.error('Error in admin/website/items/index.ts: ', error);
        return res.status(500).json({
            message: 'Internal Server Error',
        });
    }
}

export default withAuthGuard(handler);