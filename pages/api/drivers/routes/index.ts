import prisma from "@/client";
import { NextApiRequest, NextApiResponse } from "next";


interface IQuery {
    day?: string;
}

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    try {
        if (req.method !== 'GET') {
            return res.status(404).json({
                error: 'Your method is not supported',
            });
        }

        const {day } = req.query as IQuery;

        const routes = await prisma.route.findMany({
            where: {
                day,
            },
            include: {
                employee: true,
            },
        });

        return res.status(200).json({
            data: routes,
            message: 'Fetch Routes Successfully',
        });
    } catch (error: any) {
        console.log('Internal Server Error: ', error);
        return res.status(500).json({
            error: 'Internal Server Error: ' + error,
        });
    }
};

export default handler;