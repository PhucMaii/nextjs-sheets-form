import { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/client";
import withAdminAuthGuard from "@/pages/api/utils/withAdminAuthGuard";

interface IBody {
    id: number;
    time: string;
}

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    try {
        const { companyId } = req.query;
        const { id, time } = req.body as IBody;

        if (!companyId || !id || !time) {
            return res.status(400).json({ error: 'Company ID, ID, and time are required' });
        }

        const schedule = await prisma.programSchedule.update({
            where: { id },
            data: { time },
        });

        return res.status(200).json({ message: 'Schedule updated successfully', data: schedule });
    } catch (error: any) {
        console.log('Internal Server Error: ', error);
        return res.status(500).json({ error: 'Internal Server Error: ' + error });
    }
}

export default withAdminAuthGuard(handler);