import { PrismaClient } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";
import { getUserInfo } from "../../utils/auth";
import { getTodayDate } from "../../utils/date";
import { MEDIA_TYPE } from "@/app/utils/enum";

interface ProductLoss {
    inventoryItemId: number;
    employeeId: number;    
    quantityLost: number;
    lossType: string;
    description: string;
    totalCost: number;
    reportedDate: string;
    inventoryUnitId: number;
}

interface IBody {
    productLoss: ProductLoss;
    fileKeys: string[];
}

const prisma = new PrismaClient();

export default async function POST(req: NextApiRequest, res: NextApiResponse) {
    try {
        const { productLoss, fileKeys } = req.body as IBody;

        const admin: any = await getUserInfo(req, res);
        const today = getTodayDate();

        const newProductLoss = await prisma.lossReport.create({
            data: {
                inventoryItemId: productLoss.inventoryItemId,
                employeeId: productLoss.employeeId,
                quantityLost: productLoss.quantityLost,
                inventoryUnitId: productLoss.inventoryUnitId,
                totalCost: productLoss.totalCost,
                lossType: productLoss.lossType,
                description: productLoss.description,
                reportedDate: productLoss.reportedDate,
                createdAt: today.dateAndTime,
                createdBy: `${admin?.role || 'Admin'} - ${admin?.clientName}`,
            }
        });

        if (fileKeys.length > 0) {
            await prisma.media.createMany({
                data: fileKeys.map((fileKey) => ({
                    type: MEDIA_TYPE.LOSS_REPORT,
                    lossReportId: newProductLoss.id,
                    fileKey,
                    createdAt: today.dateAndTime,
                    createdBy: `${admin?.role || 'Admin'} - ${admin?.clientName}`,
                })),
            });
        }

        return res.status(200).json({
            message: 'Product loss reported successfully',
            data: newProductLoss,
        });
    } catch (error: any) {
        console.log('Internal server error', error);
        return res.status(500).json({
            message: 'Internal server error',
            error: error.message,
        });
    }
}