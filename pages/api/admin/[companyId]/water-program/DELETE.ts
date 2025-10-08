import prisma from "@/client";
import { NextApiRequest, NextApiResponse } from "next";

export default async function DELETE(req: NextApiRequest, res: NextApiResponse) {
    try {
        const { id } = req.query;

        if (!id) {
            return res.status(404).json({ error: 'Water program id is required' });
        }

        const existingWaterProgram = await prisma.waterProgram.findUnique({
            where: { id: Number(id) },
        });

        if (!existingWaterProgram) {
            return res.status(404).json({ error: 'Water program not found' });
        }
        
        await prisma.zoneWater.deleteMany({
            where: { waterId: Number(id) },
        });

        await prisma.waterProgram.delete({
            where: { id: Number(id) },
        });


        return res.status(200).json({ message: 'Water program deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
}