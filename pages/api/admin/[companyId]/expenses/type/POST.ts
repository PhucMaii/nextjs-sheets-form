import prisma from "@/client";
import { NextApiRequest, NextApiResponse } from "next";
import { errorResponse } from "@/pages/api/utils/response";

export default async function POST(req: NextApiRequest, res: NextApiResponse) {
    try {
        const { type } = req.body;

        const { companyId } = req.query;

        if (!companyId) {
            return res.status(400).json({ error: 'Company ID is required' });
        }

        // Check if type is already existed
        const existingType = await prisma.expenseType.findFirst({
            where: {
                name: type,
                companyId: Number(companyId),
            },
        });

        if (existingType) {
            return res.status(400).json({ error: 'Type already existed' });
        }

        const newType = await prisma.expenseType.create({
            data: {
                name: type,
                companyId: Number(companyId),
            },
        });

        return res.status(200).json({ data: newType, message: 'Type created successfully' });
    } catch (error) {
        console.log('Internal Server Error: ', error);
        return errorResponse(res, error);
    }
}