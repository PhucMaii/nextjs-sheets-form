import { getDriverInfo } from "@/pages/api/utils/auth";
import { getTodayDate } from "@/pages/api/utils/date";
import withDriverAuthGuard from "@/pages/api/utils/withDriverAuthGuar";
import { PrismaClient } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    try {
        if (req.method !== 'GET') {
            return res.status(404).json({ error: 'Your method is not supported' });
        }

        const prisma = new PrismaClient();

        const driver: any = await getDriverInfo(req, res);

        const today = getTodayDate();

        const shiftSession = await prisma.shiftSession.findMany({
            where: {
                driverId: driver.id,
                date: today.date,
            },
        });

        return res.status(200).json({ data: shiftSession, message: 'Fetch Shift Session Successfully' });
    } catch (error: any) {
        console.log('Internal Server Error: ', error);
        return res.status(500).json({ error: 'Internal Server Error: ' + error });
    }
}

export default withDriverAuthGuard(handler);