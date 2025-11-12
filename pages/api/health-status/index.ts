import prisma from "@/client";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method !== 'GET') {
      return res.status(404).json({error: 'Method not supported'})
    }
    const { companyId } = req.query;

    const settings = await prisma.settings.findUnique({
      where: { companyId: Number(companyId) },
    });
    
    return res.status(200).json({ data: settings, message: 'Settings fetched successfully' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}