import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { FIXED_TRANSACTION_STATUS } from '@/app/utils/enum';

const prisma = new PrismaClient();

interface IQuery {
  id?: string;
}

export default async function DELETE(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  try {
    const { id } = req.query as IQuery;

    if (!id) {
      return res.status(400).json({ error: 'ID is required' });
    }

    const fixedTransaction = await prisma.fixedTransaction.findUnique({
      where: {
        id: +id,
      },
    });

    if (!fixedTransaction) {
      return res.status(404).json({ error: 'Fixed transaction not found' });
    }

    await prisma.fixedTransaction.update({
      where: {
        id: +id,
      },
      data: {
        status: FIXED_TRANSACTION_STATUS.ARCHIVED,
      },
    });

    return res.status(200).json({
      message: 'Fixed transaction deleted successfully',
      data: fixedTransaction,
    });
  } catch (error) {
    console.log('InternaloServernError', error);
    return res.status(500).json({ error: 'Internal Server Error: ' + error });
  }
}
