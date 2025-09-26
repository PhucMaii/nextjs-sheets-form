import { errorResponse, successResponse } from "@/pages/api/utils/response";
import prisma from "@/client";
import { NextApiRequest, NextApiResponse } from "next";
import { normalizeDate } from "@/pages/api/utils/date";
import { generateListOfDateString } from "@/app/utils/time";

interface IQuery {
  companyId?: string;
  inventoryItemId?: string;
  startDate?: string;
  endDate?: string;
}

export default async function GET(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { companyId, inventoryItemId, startDate, endDate } = req.query as IQuery;

    if (!companyId) {
      return errorResponse(res, 'Company ID is required');
    }

    if (!inventoryItemId) {
      return errorResponse(res, 'Inventory item ID is required');
    }

    if (!startDate || !endDate) {
      return errorResponse(res, 'Date range is required');
    }

    const formattedStartDate = normalizeDate(new Date(startDate));
    const formattedEndDate = normalizeDate(new Date(endDate));

    const listOfDateString = generateListOfDateString(formattedStartDate, formattedEndDate);

    const logs = await prisma.inventoryLog.findMany({
      where: {
        companyId: Number(companyId),
        inventoryItemId: Number(inventoryItemId),
        date: {
          in: listOfDateString,
        },
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