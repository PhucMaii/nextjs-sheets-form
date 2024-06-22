import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from '@prisma/client';
import { IItem } from "@/app/utils/type";

interface IBody {
    item: IItem;
    availability: boolean;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        if (req.method !== 'PUT') {
            return res.status(400).json({
                error: 'Your method is not supported'
            });
        }

        const prisma = new PrismaClient();

        const { item, availability }: IBody = req.body;

        const itemNameExisted = await prisma.item.findMany({
            where: {
                name: item.name
            }
        });

        if (itemNameExisted.length === 0) {
            return res.status(404).json({
                error: `No Item Found With Name ${item.name}`
            })
        }

        if (item.name.includes('BEAN')) {
            await prisma.item.updateMany({
                where: {
                    name: item.name,
                    subCategoryId: item.subCategoryId
                },
                data: {
                    availability
                }
            });
        } else {
            await prisma.item.updateMany({
                where: {
                    name: item.name,
                },
                data: {
                    availability
                }
            }); 
        }

        return res.status(200).json({
            message: 'Item Availability Updated Successfully'
        })
    } catch (error: any) {
        console.log('Internal Server Error: ', error);
        return res.status(500).json({
            error: 'Internal Server Error: ' + error
        })
    }
}