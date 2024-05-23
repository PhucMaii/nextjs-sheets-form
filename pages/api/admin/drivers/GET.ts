import { PrismaClient } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";

export default async function GET(req: NextApiRequest, res: NextApiResponse) {
    try {
        const prisma = new PrismaClient();

        const drivers = await prisma.driver.findMany();

        return res.status(200).json({
            data: drivers,
            message: 'Fetch Drivers Successfully'
        })
    } catch (error: any) {
        console.log('Internal Server Error: ', error);
        return res.status(500).json({
            error: 'Internal Server Error: ' + error
        })
    }
}