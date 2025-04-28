import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {   
        const { driverID } 
        
    } catch (error) {
        console.error('Error confirming allow:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
  
}