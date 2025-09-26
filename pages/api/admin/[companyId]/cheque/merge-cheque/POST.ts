import { USER_ROLE } from '@/app/utils/enum';
import { generateListOfDateString } from '@/app/utils/time';
import prisma from '@/client';
import { getCreatedBy } from '@/pages/api/import-sheets/utils';
import { getTodayDate, normalizeDate } from '@/pages/api/utils/date';
import { PaymentStatus } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';

interface IBody {
  chequeNumber: string;
  amount: number;
  startDate: string;
  endDate: string;
  fileKeyFront: string;
  vendorId: number;
  transactionIds: number[];
}

export default async function POST(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { companyId } = req.query;

    const {
      chequeNumber,
      amount,
      startDate,
      endDate,
      fileKeyFront,
      vendorId,
      transactionIds,
    }: IBody = req.body;

    if (
      !chequeNumber ||
      !amount ||
      !startDate ||
      !endDate ||
      !fileKeyFront ||
      !vendorId ||
      !transactionIds
    ) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    console.log('startDate', startDate);

    const formattedStartDate = normalizeDate(new Date(startDate));
    const formattedEndDate = normalizeDate(new Date(endDate));

    const listOfDateString = generateListOfDateString(
      formattedStartDate,
      formattedEndDate,
    );

    console.log('listOfDateString', listOfDateString);

    // Make sure all transactions are from the same vendor and date range and unpaid status
    const transactions = await prisma.expense.findMany({
      where: {
        id: { in: transactionIds },
        vendors: {
          some: {
            vendorId,
          },
        },
        date: { in: listOfDateString },
        status: PaymentStatus.Unpaid,
      },
    });

    if (transactions.length !== transactionIds.length) {
      return res
        .status(400)
        .json({ error: 'Some transactions are not valid to be paid' });
    }

    // Check if the total amount of transactions is equal to the amount of the cheque
    const totalAmount = transactions.reduce(
      (acc, transaction) => acc + transaction.amount,
      0,
    );

    if (totalAmount.toFixed(2) !== Number(amount).toFixed(2)) {
      return res.status(400).json({
        error:
          'Total amount of transactions is not equal to the amount of the cheque',
      });
    }

    const today = getTodayDate().dateAndTime;
    const createdBy = await getCreatedBy(req, res, USER_ROLE.ADMIN);

    // Create the cheque
    const newCheque = await prisma.cheque.create({
      data: {
        chequeNumber,
        amount,
        fileKeyFront,
        vendorId,
        startDate,
        endDate,
        year: formattedStartDate.getFullYear().toString(),
        createdAt: today,
        createdBy,
        companyId: Number(companyId),
      },
    });

    await prisma.expense.updateMany({
      where: {
        id: { in: transactionIds },
      },
      data: {
        mergeChequeId: newCheque.id,
        status: PaymentStatus.Paid,
      },
    });

    return res.status(200).json({
      data: newCheque,
      message: 'Upload Merge Cheque Successfully',
    });
  } catch (error) {
    console.log('Internal Server Error: ', error);
    return res.status(500).json({ error: 'Internal Server Error: ' + error });
  }
}
