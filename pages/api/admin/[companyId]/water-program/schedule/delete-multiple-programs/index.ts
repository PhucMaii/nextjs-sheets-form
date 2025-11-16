import prisma from "@/client";
import withAdminAuthGuard from "@/pages/api/utils/withAdminAuthGuard";
import { NextApiRequest, NextApiResponse } from "next";

interface IQuery {
    companyId?: string;
    programIds?: string;
}

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    try {
        if (req.method !== 'DELETE') {
            return res.status(405).json({ error: 'Method not allowed' });
        }

        const { companyId, programIds } = req.query as IQuery;

        if (!companyId || !programIds) {
            return res.status(400).json({ error: 'Company ID and program IDs are required' });
        }

        const programIdsArray = programIds.split(',').map((id: string) => Number(id));

        const programs = await prisma.programSchedule.findMany({
            where: {
                id: { in: programIdsArray },
            },
        });

        if (programs.length === 0) {
            return res.status(404).json({ error: 'Programs not found' });
        }

        await prisma.programSchedule.deleteMany({
            where: {
                id: { in: programIdsArray },
            },
        });

        return res.status(200).json({ message: 'Programs deleted successfully' });
    } catch (error: any) {
        console.log('Internal Server Error: ', error);
        return res.status(500).json({ error: 'Internal Server Error: ' + error });
    }
}

export default withAdminAuthGuard(handler);