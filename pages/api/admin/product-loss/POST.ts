import { PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';
import { getUserInfo } from '../../utils/auth';
import { getTodayDate } from '../../utils/date';
import { MEDIA_TYPE } from '@/app/utils/enum';
import { InventoryUnit } from '@prisma/client';
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

const prisma = new PrismaClient();

export default async function POST(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { productLoss, fileKeys } = req.body as IBody;

    const admin: any = await getUserInfo(req, res);
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
        createdBy: `${admin?.role || 'Admin'} - ${admin?.clientName}`,
      },
    });

    if (fileKeys.length > 0) {
      await prisma.media.createMany({
        data: fileKeys.map((fileKey: any) => ({
          type: MEDIA_TYPE.LOSS_REPORT,
          lossReportId: newProductLoss.id,
          fileKey,
          createdAt: today.dateAndTime,
          createdBy: `${admin?.role || 'Admin'} - ${admin?.clientName}`,
        })),
      });
    }

    // PURPOSE: Subtract the quantity lost from the inventory item
    // Get furthest in time fifos of the invenotryItem
    const fifos = await prisma.fifo.findMany({
      where: {
        inventoryItemId: productLoss.inventoryItemId,
      },
    });

    // Sort the fifos by date
    const furthestFifo = fifos.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())[0];

    // Subtract the quantity lost from the fifos
    const ratio = productLoss.inventoryUnit?.ratio || 1;
    const normalizedQuantityLost = productLoss.quantityLost * ratio;
    const updatedQuantity = furthestFifo.quantity - normalizedQuantityLost;

    // Update the fifo quantity
    await prisma.fifo.update({
      where: {
        id: furthestFifo.id,
      },
      data: {
        quantity: updatedQuantity,
      },
    });

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
