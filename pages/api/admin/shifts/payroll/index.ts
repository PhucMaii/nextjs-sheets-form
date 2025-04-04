import { formatDate } from "@/pages/api/utils/date";
import { PrismaClient } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";

const prisma = new PrismaClient();

interface IQuery {
    startDate?: string;
    endDate?: string;
}

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    try {
        if (req.method !== 'GET') {
            return res.status(405).json({ error: 'Method Not Allowed' });
        }

        const { startDate, endDate }: IQuery = req.query;

        if (!startDate || !endDate) {
            return res.status(400).json({ error: 'Missing startDate or endDate' });
        }

        const formattedStartDate = formatDate(startDate);
        const formattedEndDate = formatDate(endDate);

        const listOfDateString = generateListOfDateString(
            formattedStartDate,
            formattedEndDate,
        );

        const shifts = await prisma.shiftSession.findMany({
            where: {
                date: {
                    in: listOfDateString,
                },
            },
            include: {
                driver: true,
            },
        });

        const payroll = shifts.reduce((acc: any[], shift: any) => {
            const driverExisted = acc.find(
                (item) => item.driverId === shift.driverId,
            )
        }, []);
    } catch (error: any) {
        console.log('Internal Server Error: ', error);
        return res.status(500).json({ error: 'Internal Server Error: ' + error });
    }
}