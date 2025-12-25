import prisma from '@/client';
import { NextApiRequest, NextApiResponse } from 'next';

interface IBody {
  id: number;
  updatedTransaction: any;
}

export default async function PUT(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { id, updatedTransaction } = req.body as IBody;

    const existingFixedTransaction = await prisma.fixedTransaction.findUnique({
      where: {
        id: id,
      },
    });

    if (!existingFixedTransaction) {
      return res.status(404).json({
        error: 'Fixed transaction not found',
      });
    }

    const updatedFixedTransaction = await prisma.fixedTransaction.update({
      where: {
        id: id,
      },
      data: {
        defaultSubtotal: updatedTransaction.defaultSubtotal,
        defaultPST: updatedTransaction.defaultPST,
        defaultGST: updatedTransaction.defaultGST,
        defaultAmount: updatedTransaction.defaultAmount,
        defaultTransactionStatus: updatedTransaction.defaultTransactionStatus,
        defaultSpentBy: updatedTransaction.defaultSpentBy,
        recurrence: updatedTransaction.recurrence,
        typeId: updatedTransaction.typeId,
        hasStopped: updatedTransaction.hasStopped || false,
        lastStopAt: updatedTransaction.lastStopAt || null,
      },
    });

    return res.status(200).json({
      message: 'Fixed transaction updated successfully',
      data: updatedFixedTransaction,
    });
  } catch (error: any) {
    console.log('Internal server error', error);
    return res.status(500).json({
      error: 'Internal server error: ' + error,
    });
  }
}
