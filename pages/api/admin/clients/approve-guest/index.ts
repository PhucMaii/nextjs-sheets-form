import { USER_CATEGORIZED, USER_ROLE } from "@/app/utils/enum";
import withAdminAuthGuard from "@/pages/api/utils/withAdminAuthGuard";
import { PrismaClient } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";

interface IBody {
    id: number;
    newClientId: string;
}

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    try {
        const prisma = new PrismaClient();

        if (req.method !== 'PUT') {
            return res.status(404).json({ error: 'Your method is not supported' });
        }

        const { id, newClientId }: IBody = req.body;

        if (newClientId.trim() === '') {
            return res.status(404).json({ error: 'You are missing body data' });
        }

        const existingClient = await prisma.user.findUnique({
            where: {
                id,
            },
        });

        if (!existingClient) {
            return res.status(404).json({ error: 'Client Not Found' });
        }

        await prisma.user.update({
            where: {
                id: existingClient.id,
            },
            data: {
                clientId: newClientId.trim(),
                role: USER_ROLE.CLIENT,
                type: USER_CATEGORIZED.NONE,
            },
        });

        return res.status(200).json({ message: 'Client Approved Successfully' });
    } catch (error: any) {
        console.log('Internal Server Error: ', error);
        return res.status(500).json({ error: 'Internal Server Error: ' + error });
    }
}

export default withAdminAuthGuard(handler);