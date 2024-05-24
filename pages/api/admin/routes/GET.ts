import { PrismaClient } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";

interface QueryType {
    day?: string;
}

export default async function GET(req: NextApiRequest, res: NextApiResponse) {
    try {
        const prisma = new PrismaClient();
        const { day }: QueryType = req.query;

        const routes = await prisma.route.findMany({
            where: {
                day
            },
            include: {
                driver: true,
                clients: true,
            }
        });

        return res.status(200).json({
            data: routes,
            message: 'Fetch Routes Successfully'
        })
    } catch (error: any) {
        console.log('Internal Server Error: ', error);
        return res.status(500).json({
            error: 'Internal Server Error: ' + error
        })
    }
}