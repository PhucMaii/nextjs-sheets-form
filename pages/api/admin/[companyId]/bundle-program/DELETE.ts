import prisma from "@/client";
import { NextApiRequest,  NextApiResponse } from "next";

export default async function DELETE(req: NextApiRequest, res: NextApiResponse) {
    try {
        const { id } = req.query;

        if (!id) {
            return res.status(404).json({ error: 'Bundle program id is required' });
        }

        const existingBundleProgram = await prisma.bundleProgram.findUnique({
            where: { id: Number(id) },
        });

        if (!existingBundleProgram) {
            return res.status(404).json({ error: 'Bundle program not found' });
        }

        await prisma.bundleProgram.delete({
            where: { id: Number(id) },
        });

        return res.status(200).json({ message: 'Bundle program deleted successfully' });
    } catch (error: any) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
}