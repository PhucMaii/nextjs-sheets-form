import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/client';
import { PaymentStatus } from '@prisma/client';

interface IQuery {
  id?: string;
}

export default async function DELETE(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  try {
    const { id }: IQuery = req.query;

    if (!id) {
      return res.status(404).json({ error: 'Cheque ID is required' });
    }

    const existingCheque = await prisma.cheque.findUnique({
      where: {
        id: Number(id),
      },
      include: {
        transactions: true,
      },
    });

    if (!existingCheque) {
      return res.status(404).json({ error: 'Cheque not found' });
    }

    // Unattach transactions from cheque and set status to unpaid
    await prisma.expense.updateMany({
      where: {
        id: {
          in: existingCheque.transactions.map((transaction) => transaction.id),
        },
      },
      data: { mergeChequeId: null, status: PaymentStatus.Unpaid },
    });

    await prisma.cheque.delete({
      where: { id: Number(id) },
    });

    return res.status(200).json({
      message: 'Cheque deleted successfully',
    });
  } catch (error: any) {
    console.log('Internal Server Error: ', error);
    return res.status(500).json({ error: 'Internal Server Error: ' + error });
  }
}
