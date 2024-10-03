import { PrismaClient } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";
import withAdminAuthGuard from "../../utils/withAdminAuthGuard";
import withDriverAuthGuard from "../../utils/withDriverAuthGuar";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    try {
        if (req.method !== 'GET') {
            return res.status(404).json({
                error: 'Your method is not supported',
            })
        }

        const prisma = new PrismaClient();

        const allDrivers = await prisma.driver.findMany();

        return res.status(200).json({
            data: allDrivers,
            message: 'Fetch All Drivers Successfully',
        });
    } catch (error: any) {
        console.log('Internal Server Error: ', error);
        return res.status(500).json({
            error: 'Internal Server Error: ' + error,
        })
    }
}

export default withDriverAuthGuard(handler);