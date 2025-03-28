import { PrismaClient } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";

interface IBody {
    id: number;
    name: string;
    price: number;
    unitId: number;
    prevPrice: number;
    isShowDiscount: boolean;
}

export default async function PUT(req: NextApiRequest, res: NextApiResponse) {
    try {
        const prisma = new PrismaClient();

        const { id, name, price, prevPrice, isShowDiscount, unitId }: IBody = req.body;

        const existingOption = await prisma.option.findUnique({
            where: {
                id,
            },
        });

        if (!existingOption) {
            return res.status(404).json({
                error: 'Option Not Found',
            });
        }

        const updateFields: any = {};

        if (existingOption.name !== name) {
            updateFields.name = name;
        }

        if (existingOption.price !== price) {
            updateFields.price = price;
        }

        if (existingOption.unitId !== unitId) {
            updateFields.unitId = unitId;
        }

        if (existingOption.prevPrice !== prevPrice) {
            updateFields.prevPrice = prevPrice;
        }

        if (existingOption.isShowDiscount !== isShowDiscount) {
            updateFields.isShowDiscount = isShowDiscount;
        }

        if (Object.keys(updateFields).length === 0) {
            return res.status(200).json({
                message: 'Option Updated Successfully',
                // data: updatedOption,
            });
        }

        await prisma.option.update({
            where: {
                id,
            },
            data: {
                ...updateFields,
            },
        });

        return res.status(200).json({
            message: 'Option Updated Successfully',
            // data: updatedOption,
        });
    } catch (error: any) {
        console.log('Internal Server Error: ', error);
        return res.status(500).json({ error: 'Internal Server Error: ' + error });
    }
}