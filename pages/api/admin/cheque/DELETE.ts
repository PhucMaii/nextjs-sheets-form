import { PrismaClient } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";

interface IQuery {
    id?: string
}

const DELETE = async (req: NextApiRequest, res: NextApiResponse) => {
    try {
        const prisma = new PrismaClient();

        const { id }: IQuery = req.query;

        if (!id) {
            return res.status(404).json({
                error: 'Cheque Id Not Provided',
            });
        }

        const existingCheque = await prisma.cheque.findUnique({
            where: {
                id: Number(id),
            },
        });
        
        if (!existingCheque) {
            return res.status(404).json({
                error: 'Cheque Not Found',
            });
        }

        await prisma.cheque.delete({
            where: {
                id: Number(id),
            },
        });

        return res.status(200).json({
            message: 'Cheque Deleted Successfully',
        });
    } catch (error: any) {
        console.log('Internal Server Error: ', error);
        return res.status(500).json({ error: 'Internal Server Error: ' + error });
    }
}

export default DELETE;