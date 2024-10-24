import { PrismaClient } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";
import withDriverAuthGuard from "../../utils/withDriverAuthGuar";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    try {
        if (req.method !== 'GET') {
            return res.status(404).json({
                error: 'Your method is not supported',
            });
        }

        const prisma = new PrismaClient();

        const paymentMethods = await prisma.paymentMethod.findMany();

        return res.status(200).json({
            data: paymentMethods,
            message: 'Fetch Payment Methods Successfully',
        });
    } catch (error: any) {
        console.log('Internal Server Error: ', error);
        return res.status(500).json({
            error: 'Internal Server Error: ' + error,
        });
    }
}

export default withDriverAuthGuard(handler);