import { PrismaClient } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";

interface BodyTypes {
    routeId: number;
}

export default async function DELETE(req: NextApiRequest, res: NextApiResponse) {
    try {
        const prisma = new PrismaClient();

        const { routeId }: BodyTypes = req.body;

        const existingRoute = await prisma.route.findUnique({
            where: {
                id: routeId
            }
        });

        if (!existingRoute) {
            return res.status(404).json({
                error: 'Route Does Not Exist'
            })
        }

        await prisma.route.delete({
            where: {
                id: routeId
            }
        });

        return res.status(200).json({
            message: 'Route Deleted Successfully'
        });
    } catch (error: any) {
        console.log('Internal Server Error: ', error);
        return res.status(500).json({
            error: 'Internal Server Error: ' + error
        })
    }
}