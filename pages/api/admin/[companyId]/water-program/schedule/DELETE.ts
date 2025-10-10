import { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/client";

interface IQuery {
    id?: string;
}

export default async function DELETE(req: NextApiRequest, res: NextApiResponse) {
    try {
        const { id } = req.query as IQuery;

        if (!id) {
            return res.status(400).json({ error: 'ID is required' });
        }

        await prisma.programSchedule.delete({
            where: { id: Number(id) },
        });

        return res.status(200).json({ message: 'Schedule deleted successfully' });
    } catch (error: any) {
        console.log('Internal Server Error: ', error);
        return res.status(500).json({ error: 'Internal Server Error: ' + error });
    }
}