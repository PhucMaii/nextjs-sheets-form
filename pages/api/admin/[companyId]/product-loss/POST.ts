import {
  InventoryLogFrom,
  InventoryLogType,
  PrismaClient,
} from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import { getTodayDate } from '@/pages/api/utils/date';
import { MEDIA_TYPE } from '@/app/utils/enum';
import { InventoryUnit } from '@prisma/client';
import { manuallySubtractInventoryItemQty } from '@/pages/api/utils/inventoryItem';
import { recordInventoryItemLog } from '@/pages/api/utils/logs';
interface ProductLoss {
  inventoryItemId: number;
  employeeId: number;
  quantityLost: number;
  lossType: string;
  description: string;
  totalCost: number;
  reportedDate: string;
  inventoryUnitId: number;
  reportedBy: string;
  inventoryUnit: InventoryUnit;
}

interface IBody {
  productLoss: ProductLoss;
  fileKeys: string[];
}

interface IQuery {
  companyId?: string;
}

const prisma = new PrismaClient();

export default async function POST(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { productLoss, fileKeys } = req.body as IBody;
    const { companyId } = req.query as IQuery;

    if (!companyId) {
      return res.status(400).json({
        message: 'Company ID is required',
      });
    }

    const session: any = await getServerSession(req, res, authOptions);
    const admin: any = session?.user;
    const today = getTodayDate();

    const newProductLoss = await prisma.lossReport.create({
      data: {
        inventoryItemId: productLoss.inventoryItemId,
        quantityLost: productLoss.quantityLost,
        inventoryUnitId: productLoss.inventoryUnitId,
        totalCost: Number(productLoss.totalCost),
        lossType: productLoss.lossType,
        description: productLoss.description,
        reportedDate: productLoss.reportedDate,
        reportedBy: productLoss.reportedBy,
        createdAt: today.dateAndTime,
        createdBy: `${admin?.role || 'Admin'} - ${admin?.name}`,
        companyId: Number(companyId),
      },
    });

    if (fileKeys.length > 0) {
      await prisma.media.createMany({
        data: fileKeys.map((fileKey: any) => ({
          type: MEDIA_TYPE.LOSS_REPORT,
          lossReportId: newProductLoss.id,
          fileKey,
          createdAt: today.dateAndTime,
          createdBy: `${admin?.role || 'Admin'} - ${admin?.name}`,
        })),
      });
    }

    await manuallySubtractInventoryItemQty(
      productLoss.inventoryItemId,
      productLoss.quantityLost,
      productLoss?.inventoryUnit?.ratio || 1,
    );

    // Record inventory log
    await recordInventoryItemLog(
      newProductLoss.id,
      productLoss.inventoryItemId,
      productLoss.quantityLost,
      InventoryLogType.LOST,
      InventoryLogFrom.CREATE_LOSS_REPORT,
      `Subtract ${productLoss.quantityLost} ${productLoss.inventoryItemId} from inventory due to lost report ${newProductLoss.id}`,
    );

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
