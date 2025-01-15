import { PrismaClient } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";

export default async function PUT(req: NextApiRequest, res: NextApiResponse) {
    try {
        const prisma = new PrismaClient();

        const { month, clientIds }
    } catch (error: any) {
        console.log('Internal Server Error: ', error);
    }
}