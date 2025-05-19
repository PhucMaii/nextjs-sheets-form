import withAdminAuthGuard from "@/pages/api/utils/withAdminAuthGuard";
import { NextApiRequest, NextApiResponse } from "next";
import GET from "./GET";
import PUT from "./PUT";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    try {
        if (req.method === 'GET') {
            return GET(req, res);
        }

        if (req.method === 'PUT') {
            return PUT(req, res);
        }

        return res.status(404).json({ error: 'Method not allowed' });
    } catch (error: any) {
        console.error('Internal Server Error: ', error);
        res.status(500).json({ error: 'Internal server error: ' + error });
    }
}

export default withAdminAuthGuard(handler);