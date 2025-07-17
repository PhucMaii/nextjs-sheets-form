import { otherPaymentMethodId } from '@/app/lib/constant';
import { TRANSACTION_STATUS } from '@/app/utils/enum';
import { getTodayDate } from '@/pages/api/utils/date';
import withAdminAuthGuard from '@/pages/api/utils/withAdminAuthGuard';
import { PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';

interface IBody {
  id?: number;
  idsToUpdate?: number[];
  status: TRANSACTION_STATUS;
  newPaymentMethodId: any;
}

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    if (req.method !== 'PUT') {
      return res.status(404).json({
        error: 'Your method is not supported',
      });
    }

    const prisma = new PrismaClient();
    const { id, idsToUpdate, status, newPaymentMethodId }: IBody = req.body;

    const today = getTodayDate().dateAndTime;

    if (id) {
      const existingExpense = await prisma.expense.findUnique({
        where: {
          id,
        },
        include: {
          paymentMethod: true,
        },
      });

      if (!existingExpense) {
        return res.status(404).json({
          error: 'Expense Not Found',
        });
      }

      if (
        status === TRANSACTION_STATUS.PAID &&
        existingExpense.paymentMethodId === otherPaymentMethodId &&
        newPaymentMethodId === otherPaymentMethodId
      ) {
        return res.status(500).json({
          error: 'OTHER payment method not allowed to be marked as PAID',
        });
      }

      // Handle update other payment method status
      if (
        existingExpense.paymentMethodId === otherPaymentMethodId &&
        newPaymentMethodId !== otherPaymentMethodId &&
        status === TRANSACTION_STATUS.PAID
      ) {
        await prisma.expense.update({
          where: {
            id,
          },
          data: {
            status,
            paymentMethodId: newPaymentMethodId,
            paidAt: today,
          },
        });
      } else {
        await prisma.expense.update({
          where: {
            id,
          },
          data: {
            status,
            paidAt: status === TRANSACTION_STATUS.PAID ? today : null,
          },
        });
      }

      return res.status(200).json({
        message: 'Update Expense Status Successfully',
      });
    }

    if (idsToUpdate) {
      await prisma.expense.updateMany({
        where: {
          id: {
            in: idsToUpdate,
          },
        },
        data: {
          status,
          paidAt: status === TRANSACTION_STATUS.PAID ? today : null,
        },
      });

      // Handle update other payment method status
      if (
        newPaymentMethodId !== otherPaymentMethodId &&
        status === TRANSACTION_STATUS.PAID
      ) {
        await prisma.expense.updateMany({
          where: {
            id: {
              in: idsToUpdate,
            },
            paymentMethodId: otherPaymentMethodId,
          },
          data: {
            paymentMethodId: newPaymentMethodId,
          },
        });
      }

      return res.status(200).json({
        message: 'Update Expense Status Successfully',
      });
    }

    return res.status(404).json({
      error: 'Missing body data',
    });
  } catch (error: any) {
    console.log('Internal Server Error: ', error);
    return res.status(500).json({
      error: 'Internal Server Error: ' + error,
    });
  }
};

export default withAdminAuthGuard(handler);
