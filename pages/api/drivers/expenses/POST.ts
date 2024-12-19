import { PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';
import { getDriverInfo } from '../../utils/auth';
import { mainPaymentMethodId } from '@/app/lib/constant';
import { TRANSACTION_STATUS } from '@/app/utils/enum';

interface IBody {
  amount: number;
  PST: number;
  GST: number;
  subTotal: number;
  date: string;
  paymentMethodId: number;
  description: string;
  status: TRANSACTION_STATUS;
  createdAt: string;
}

export default async function POST(req: NextApiRequest, res: NextApiResponse) {
  try {
    const prisma = new PrismaClient();

    const {
      amount,
      PST,
      GST,
      subTotal,
      date,
      paymentMethodId,
      description,
      // status
      createdAt,
    }: IBody = req.body;

    const driver = await getDriverInfo(req, res);

    if (!driver) {
      return res.status(401).json({
        error: 'Unauthorized',
      });
    }

    const existingMethod = await prisma.paymentMethod.findUnique({
      where: {
        id: paymentMethodId,
      },
    });

    if (!existingMethod) {
      return res.status(404).json({
        error: 'Payment Method Not Found',
      });
    }

    if (paymentMethodId !== mainPaymentMethodId) {
      return res.status(400).json({
        error: 'Payment Method Not Allowed',
      });
    }

    const dateBoard = await prisma.codBoard.findFirst({
      where: {
        date: date,
        driverId: driver.id,
      },
      include: {
        expense: true,
      },
    });

    if (!dateBoard) {
      return res.status(404).json({
        error: `Your Board Is Not Available For ${date}`,
      });
    }

    // Create new expense
    // if (dateBoard.expense.length > 0) {
    //   const updatedExpense = await prisma.expense.update({
    //     where: {
    //       id: dateBoard.expense[0].id,
    //     },
    //     data: {
    //       amount: amount,
    //       date: date,
    //       description: description,
    //     },
    //   });

    //   const newBalance =
    //     existingMethod.balance + amount - dateBoard.expense[0].amount;

    //   await prisma.paymentMethod.update({
    //     where: {
    //       id: paymentMethodId,
    //     },
    //     data: {
    //       balance: newBalance,
    //     },
    //   });

    //   return res
    //     .status(200)
    //     .json({ data: updatedExpense, message: 'Update Expense Successfully' });
    // }

    const newExpense = await prisma.expense.create({
      data: {
        amount: amount,
        subTotal: subTotal,
        PST: PST,
        GST: GST,
        date: date,
        paymentMethodId: paymentMethodId,
        description: description,
        createdAt,
        status: TRANSACTION_STATUS.PAID,
        spentBy: `Driver - ${driver?.name}`,
        createdBy: `Driver - ${driver?.name}`,
        codBoardId: dateBoard.id,
      },
    });

    const newBalance = existingMethod.balance + amount;

    await prisma.paymentMethod.update({
      where: {
        id: paymentMethodId,
      },
      data: {
        balance: newBalance,
      },
    });

    return res
      .status(200)
      .json({ data: newExpense, message: 'Add Expense Successfully' });
  } catch (error: any) {
    console.log('Internal Server Error: ', error);
    return res.status(500).json({
      error: 'Internal Server Error: ' + error,
    });
  }
}
