import withAuthGuard from "@/pages/api/utils/withAuthGuard";
import { NextApiRequest, NextApiResponse } from "next";
import POST from "./POST";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    try {
        if (req.method === 'POST') {
            const response = await POST(req, res);
            return response;
        }

        return res.status(404).json({
            error: 'Your method is not supported',
        });
    } catch (error: any) {
        console.log('Internal Server Error: ', error);
    }
}

export default withAuthGuard(handler);