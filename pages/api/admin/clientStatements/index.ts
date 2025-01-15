import { NextApiRequest, NextApiResponse } from "next";
import withAdminAuthGuard from "../../utils/withAdminAuthGuard"

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    try {
        
    } catch (error: any) {
        console.log('Internal Server Error: ', error);
        return res.status(500).json({ error: 'Internal Server Error: ' + error });
    }
}

export default withAdminAuthGuard(handler);