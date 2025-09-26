import prisma from "@/client";
import { NextApiRequest, NextApiResponse } from "next";
import { errorResponse } from "@/pages/api/utils/response";

export default async function PUT(req: NextApiRequest, res: NextApiResponse) {
    try {
        const { companyId } = req.query;

        const { id, newName } = req.body;

        // Check if newName is already existed
        const existingType = await prisma.expenseType.findFirst({
            where: { name: newName, companyId: Number(companyId) },
        });

        if (existingType) {
            return res.status(400).json({ error: 'Type name already existed' });
        }

        const updatedType = await prisma.expenseType.update({
            where: { id: Number(id) },
            data: { name: newName },
        });

        return res.status(200).json({ data: updatedType, message: 'Type updated successfully' });
    } catch (error) {
        console.log('Internal Server Error', error);
        return errorResponse(res, error);
    }
}   