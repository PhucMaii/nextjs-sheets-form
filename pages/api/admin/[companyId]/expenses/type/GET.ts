import { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/client";
import { errorResponse } from "@/pages/api/utils/response";

export default async function GET(req: NextApiRequest, res: NextApiResponse) {
    try {
        const { companyId } = req.query;
    
        const expenses = await prisma.expenseType.findMany({
            where: {
                companyId: Number(companyId),
            },
        });
    
        return res.status(200).json({ data: expenses, message: 'GET method' });

    } catch (error: any) {
        console.log('Internal Server Error', error);
        return errorResponse(res, error);
    }
}