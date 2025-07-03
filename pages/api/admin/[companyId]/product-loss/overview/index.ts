import { generateListOfDateString } from '@/app/utils/time';
import { IProductLoss } from '@/app/utils/type';
import { formatDate } from '@/pages/api/utils/date';
import withAdminAuthGuard from '@/pages/api/utils/withAdminAuthGuard';
import { LossReport } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/client';

interface IQuery {
  startDate?: string;
  endDate?: string;
  companyId?: string;
}

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const { startDate, endDate, companyId } = req.query as IQuery;

    if (!startDate || !endDate) {
      return res.status(400).json({
        message: 'Start date and end date are required'});
    }

    if (!companyId) {
      return res.status(400).json({
        error: 'Company ID is required'});
    }

    const formattedStartDate = formatDate(startDate);
    const formattedEndDate = formatDate(endDate);
    const listOfDates = generateListOfDateString(
      formattedStartDate,
      formattedEndDate,
    );

    const productLosses: any = await prisma.lossReport.findMany({
      where: {
        reportedDate: {
          in: listOfDates},
        companyId: Number(companyId)},
      include: {
        medias: true,
        inventoryItem: true,
        inventoryUnit: true}});

    const totalLoss = productLosses.reduce(
      (acc: number, loss: LossReport) => acc + (loss?.totalCost || 0),
      0,
    );

    const lossQuantity = productLosses.reduce(
      (acc: number, loss: LossReport) => acc + (loss?.quantityLost || 0),
      0,
    );

    const totalLossByItem = productLosses.reduce(
      (acc: any, loss: IProductLoss) => {
        const itemName = loss?.inventoryItem?.name;

        if (!itemName) return acc;

        if (!acc[itemName]) {
          acc[itemName] = {
            item: loss?.inventoryItem,
            totalLoss: 0,
            lossQuantity: 0,
            lossType: loss?.lossType};
        }

        acc[itemName].totalLoss += loss?.totalCost || 0;
        acc[itemName].lossQuantity += loss?.quantityLost || 0;
        acc[itemName].lossType = loss?.lossType;
        return acc;
      },
      {},
    );

    const recurringLossType = productLosses.reduce((acc: any, loss: any) => {
      const lossType = loss?.lossType;
      if (!lossType) return acc;

      if (acc[lossType]) {
        acc[lossType] += 1;
      } else {
        acc[lossType] = 1;
      }
      return acc;
    }, {});

    const mostCommonLossType = Object.entries(recurringLossType).sort(
      (a: any, b: any) => b[1] - a[1],
    )[0];

    return res.status(200).json({
      data: {
        productLosses: productLosses.slice(0, 3),
        totalLoss,
        lossQuantity,
        totalLossByItem,
        losses: productLosses,
        mostCommonLossType: mostCommonLossType ? mostCommonLossType[0] : 'N/A'},
      message: 'Product loss overview retrieved successfully'});
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: 'Internal server error'});
  }
};

export default withAdminAuthGuard(handler);
