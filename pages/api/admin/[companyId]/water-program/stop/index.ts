import axios from "axios";
import { NextApiRequest, NextApiResponse } from "next";
import withAdminAuthGuard from "@/pages/api/utils/withAdminAuthGuard";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    try {
        const { companyId } = req.query;

        const { zoneId } = req.body;

        if (!companyId || !zoneId) {
            return res.status(400).json({ error: 'Company ID and zone ID are required' });
        }
        
        await axios.get('https://api.hydrawise.com/api/v1/setzone.php', {
            params: {
                api_key: process.env.HYDRAWISE_API_KEY,
                action: 'stopall',
                // relay_id: zoneId,
            },
        });

        return res.status(200).json({ message: 'Water program stopped successfully' });
    } catch (error: any) {
        console.log('Internal Server Error: ', error);
        return res.status(500).json({ error: 'Internal Server Error: ' + error });
    }
}

export default withAdminAuthGuard(handler);