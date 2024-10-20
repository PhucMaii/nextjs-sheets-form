import { PrismaClient } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";
import withAdminAuthGuard from "../../utils/withAdminAuthGuard";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    try {
        if (req.method !== 'GET') {
            return res.status(404).json({ error: 'Your method is not supported' });
        }

        const prisma = new PrismaClient();

        const admins = await prisma.user.findMany({
            where: {
                role: 'admin'
            }
        });

        return res.status(200).json({ data: admins, message: 'Fetch Admins Successfully' });

    } catch (error) {
        console.log('Internal Server Error: ', error);
        return res.status(500).json({ error: 'Internal Server Error: ' + error });
    }
};

export default withAdminAuthGuard(handler);