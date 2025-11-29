import { NextApiRequest, NextApiResponse } from "next";
import { errorResponse } from "@/pages/api/utils/response";
import GET from "./GET";
import withAdminAuthGuard from "@/pages/api/utils/withAdminAuthGuard";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    try {
        if (req.method === 'GET') {
            const response = await GET(req, res);
            return response;
        }

        return res.status(404).json({ error: 'Your method is not supported' });
    } catch (error: any) {
        console.log('Internal Server Error', error);
        return errorResponse(res, error);
    }
}

export default withAdminAuthGuard(handler);