import { PrismaClient } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";
import withAdminAuthGuard from "../../../utils/withAdminAuthGuard";
const prisma = new PrismaClient();

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    try {
        if (req.method !== 'PUT') {
            return res.status(405).json({ error: 'Method not allowed' });
        }

        const { id, status } = req.body;

        const po = await prisma.pO.findUnique({
            where: {
                id: id,
            },
        });
        
        if (!po) {
            return res.status(404).json({ error: 'Purchase order not found' });
        }

        await prisma.pO.update({
            where: { id: id },
            data: {
                status: status,
            },
        });

        return res.status(200).json({ message: 'Purchase order status updated' });
    } catch (error) {
        console.log('Internal Server Error: ', error);
        return res.status(500).json({ error: 'Internal Server Error: ' + error });
    }
}

export default withAdminAuthGuard(handler);