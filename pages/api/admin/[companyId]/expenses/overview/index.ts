import { generateListOfDateString } from "@/app/utils/time";
import prisma from "@/client";
import { normalizeDate } from "@/pages/api/utils/date";
import { errorResponse, successResponse } from "@/pages/api/utils/response";
import withAdminAuthGuard from "@/pages/api/utils/withAdminAuthGuard";
import { NextApiRequest, NextApiResponse } from "next";
import prisma from '@/client';

interface IQuery {
    companyId: string;
    startDate: string;
    endDate: string;
}

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    if (req.method !== 'GET') {
        return res.status(404).json({
            error: 'Method not allowed',
        });
    }

    try {
        const { companyId, startDate, endDate }: IQuery = req.query as any;

        const formattedStartDate = normalizeDate(new Date(startDate as string));
        const formattedEndDate = normalizeDate(new Date(endDate as string));

        if (formattedStartDate > formattedEndDate) {
            return res.status(400).json({
                error: 'Start date must be before end date',
            });
        }

        const listOfDateString = generateListOfDateString(formattedStartDate, formattedEndDate);
        const expenses = await prisma.expense.findMany({
            where: {
                companyId: Number(companyId),
                date: {
                    in: listOfDateString,
                }
            },
        });

        // const expensesByDate = expenses.reduce((acc, expense) => {
        //     const date = expense.date;
        //     acc[date] = (acc[date] || 0) + expense.amount;
        //     return acc;
        // }, {} as Record<string, number>);

        return successResponse(res, expenses);
    } catch (error: any) {
        console.log('Internal Server Error', error);
        return errorResponse(res, error);
    }
}

export default withAdminAuthGuard(handler);