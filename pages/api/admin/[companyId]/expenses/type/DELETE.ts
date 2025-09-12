import { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/client";
import { errorResponse } from "@/pages/api/utils/response";

export default async function DELETE(req: NextApiRequest, res: NextApiResponse) {
    try {
        const { id } = req.query;
        
        if (!id) {
            return res.status(400).json({ error: 'Type ID is required' });
        }

        // unattach all transactions related to this type
        await prisma.expense.updateMany({
            where: { typeId: Number(id) },
            data: { typeId: null },
        });

        const deletedType = await prisma.expenseType.delete({
            where: { id: Number(id) },
        });

        return res.status(200).json({ data: deletedType, message: 'Type deleted successfully' });
    } catch (error) {
        console.log('Internal Server Error', error);
        return errorResponse(res, error);
    }
}