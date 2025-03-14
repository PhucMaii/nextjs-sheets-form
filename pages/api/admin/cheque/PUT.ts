import { PrismaClient } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";

interface IBody {
    id: number;
    updatedCheque: {
        fileKeyFront: string;
        fileKeyBack?: string;
        month: string;
        year: string;
        chequeNumber: string;
        amount: number;
    };
}

export default async function PUT(req: NextApiRequest, res: NextApiResponse) {
    try {
        const prisma = new PrismaClient();

        const { id, updatedCheque }: IBody = req.body;

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

        console.log(updatedCheque, 'updatedCheque');
        const cheque = await prisma.cheque.update({
            where: {
                id: Number(id),
            },
            data: {
                ...updatedCheque,
            },
        });

        return res.status(200).json({
            message: 'Cheque Updated Successfully',
            data: cheque,
        });
    } catch (error: any) {
        console.log('Internal Server Error: ', error);
        return res.status(500).json({ error: 'Internal Server Error: ' + error });
    }
}