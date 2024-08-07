import { PrismaClient } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";

interface IQuery {
    deletedRangeId?: string;
}

export default async function DELETE(req: NextApiRequest, res: NextApiResponse) {
    try {
        const prisma = new PrismaClient();

        const { deletedRangeId }: IQuery = req.query;

        if (!deletedRangeId) {
            return res.status(404).json({
                error: "Deleted Range Id Missing"
            });
        }

        const existingRange = await prisma.dayRange.findUnique({
            where: {
                id: Number(deletedRangeId)
            }
        });

        if (!existingRange) {
            return res.status(404).json({
                error: 'Range Not Found'
            })
        }

        const deletedRange = await prisma.dayRange.delete({
            where: {
                id: existingRange.id
            }
        });

        return res.status(200).json({
            message: 'Unavailable Range Deleted Successfully',
            data: deletedRange
        });
    } catch (error: any) {
        console.log('Internal Server Error: ', error);
        return res.status(500).json({
            error: 'Internal Server Error: ' + error
        })
    }
}