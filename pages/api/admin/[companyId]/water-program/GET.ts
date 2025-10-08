import prisma from "@/client";
import { NextApiRequest, NextApiResponse } from "next";

export default async function GET(req: NextApiRequest, res: NextApiResponse) {
    try {
        const { companyId } = req.query;

        if (!companyId) {
            return res.status(400).json({ error: 'Company ID is required' });
        }

        const waterPrograms = await prisma.waterProgram.findMany({
            where: {
                companyId: Number(companyId),
            },
            include: {
                zoneWaterPrograms: true,
            }
        });

        return res.status(200).json({ data: waterPrograms });
        
    } catch (error: any) {
        console.log('Internal Server Error: ', error);
        return res.status(500).json({ error: 'Internal Server Error: ' + error });
    }
}