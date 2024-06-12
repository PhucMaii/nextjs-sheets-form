import { IItem } from "@/app/utils/type";
import { PrismaClient } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";

interface IBody {
    newItem: IItem;
    categoryId: number;
}

export default async function POST(req: NextApiRequest, res: NextApiResponse) {
    try {
        const prisma = new PrismaClient();

        const { newItem, categoryId }: IBody = req.body;

        
    } catch (error: any) {
        console.log('Internal Server Error: ', error);
        return res.status(500).json({
            error: 'Internal Server Error: ' + error
        })
    }
}

const checkIsItemValid = async (newItem: IItem) => {
    try {
        const prisma = new PrismaClient();
    } catch (error: any) {
        console.log('Internal Server Error in checking item: ', error);
        
    }
}