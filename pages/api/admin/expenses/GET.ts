import { generateListOfDateString } from "@/app/utils/time";
import { PrismaClient } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";
import { normalizeDate } from "../../utils/date";

interface IQuery {
    startDate?: string;
    endDate?: string;
    id?: number;
}

export default async function GET(req: NextApiRequest, res: NextApiResponse) {
    try {
        const prisma = new PrismaClient();

        const { startDate, endDate, id }: IQuery = req.query;

        if (!startDate || !endDate) {
            return res.status(404).json({ error: 'Missing required parameters' });
        }

        const formattedStartDate = normalizeDate(new Date(startDate));
        const formattedEndDate = normalizeDate(new Date(endDate));

        const listOfDateString = generateListOfDateString(
            formattedStartDate,
            formattedEndDate,
        );

        if (!id || Number(id) < 0) {
            const expenses = await prisma.expense.findMany({
                where: {
                    date: {
                        in: listOfDateString
                    }
                }
            });
            
            return res.status(200).json({
                data: expenses,
                message: 'Fetch Expenses successfully',
            });
        }

        const expenses = await prisma.expense.findMany({
            where: {
                date: {
                    in: listOfDateString
                },
                id: Number(id)
            }
        });
        
        return res.status(200).json({
            data: expenses,
            message: 'Fetch Expenses successfully',
        });
    }  
     catch (error: any) {
        console.log('Internal Server Error: ', error);
        return res.status(500).json({ error: 'Internal Server Error: ' + error });
    }
}