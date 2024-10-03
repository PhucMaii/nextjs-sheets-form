import { NextApiRequest, NextApiResponse } from "next";
import withAdminAuthGuard from "../../utils/withAdminAuthGuard";
import POST from "./POST";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    try {
        if (req.method === 'POST') {
            const response = await POST(req, res);
            return response;
        }
    } catch (error: any) {
        console.log('Internal Server Error: ', error);
    }
}

export default withAdminAuthGuard(handler);