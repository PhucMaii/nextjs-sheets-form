import prisma from "@/client";
import { errorResponse, successResponse } from "@/pages/api/utils/response";
import withDriverAuthGuard from "@/pages/api/utils/withDriverAuthGuar";
import { ReassignmentStatus } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    try {
        if (req.method !== 'POST') {
            return errorResponse(res, 'Method not allowed');
        }

        const { orderIds } = req.body;

        if (!orderIds || orderIds.length === 0) {
            return errorResponse(res, 'Order IDs are required');
        }

        await prisma.reassignment.updateMany({
            where: {
                orderId: {
                    in: orderIds,
                },
            },
            data: {
                status: ReassignmentStatus.ACCEPTED,
            }
        });

        return successResponse(res, 'Orders accepted successfully');
    } catch (error: any) {
        console.log('Internal Server Error: ', error);
        return errorResponse(res, error);
    }
}

export default withDriverAuthGuard(handler);