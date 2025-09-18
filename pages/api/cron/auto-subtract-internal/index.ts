import { NextApiRequest, NextApiResponse } from 'next';
import { errorResponse } from '../../utils/response';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const authHeader = req.headers.authorization;
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
        // Get all automation rules
    } catch (error) {
        return errorResponse(res, error);
    }
    
}