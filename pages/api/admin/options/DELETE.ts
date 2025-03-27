import { PrismaClient } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";

interface IQuery {
    id?: string;
}

export default async function DELETE(req: NextApiRequest, res: NextApiResponse) {
    try {
        const prisma = new PrismaClient();

        const { id }: IQuery = req.query;

        if (!id) {
            return res.status(404).json({
                error: 'Option Id Not Provided',
            });
        }

        const existingOption = await prisma.option.findUnique({
            where: {
                id: Number(id),
            },
        });

        if (!existingOption) {
            return res.status(404).json({
                error: 'Option Not Found',
            });
        }

        await prisma.option.delete({
            where: {
                id: Number(id),
            },
        });

        return res.status(200).json({
            message: `Option ${existingOption.name} Deleted Successfully`,
        });
    } catch (error: any) {
        console.log('Internal Server Error: ', error);
        return res.status(500).json({
            error: 'Internal Server Error: ' + error,
        });
    }
}