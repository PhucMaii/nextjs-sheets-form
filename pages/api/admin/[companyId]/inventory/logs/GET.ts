import { errorResponse, successResponse } from "@/pages/api/utils/response";
import prisma from "@/client";
import { NextApiRequest, NextApiResponse } from "next";

interface IQuery {
  companyId?: string;
  inventoryItemId?: string;
}

export default async function GET(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { companyId, inventoryItemId } = req.query as IQuery;

    if (!companyId) {
      return errorResponse(res, 'Company ID is required');
    }

    if (!inventoryItemId) {
      return errorResponse(res, 'Inventory item ID is required');
    }

    const logs = await prisma.inventoryLog.findMany({
      where: {
        companyId: Number(companyId),
        inventoryItemId: Number(inventoryItemId),
      },
      include: {
        inventoryItem: true,
        order: true,
        transaction: true,
      },
    });

    return successResponse(res, logs);
  } catch (error) {
    errorResponse(res, error);
  }
}