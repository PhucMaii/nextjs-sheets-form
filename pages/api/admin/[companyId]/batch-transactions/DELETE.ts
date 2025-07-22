import { prisma } from '@/lib/prisma';
import { NextApiRequest, NextApiResponse } from 'next';
import withAdminAuthGuard from '@/pages/api/utils/withAdminAuthGuard';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const { id }: { id?: string } = req.query;

    if (!id) {
      return res
        .status(404)
        .json({ error: 'Batch Transaction Id Not Provided' });
    }

    const existingBatchTransaction = await prisma.batchTransaction.findUnique({
      where: {
        id: Number(id),
      },
    });

    if (!existingBatchTransaction) {
      return res.status(404).json({ error: 'Batch Transaction Not Found' });
    }

    await prisma.batchTransaction.delete({
      where: { id: Number(id) },
    });

    return res
      .status(200)
      .json({ message: 'Batch Transaction Deleted Successfully' });
  } catch (error: any) {
    console.error('Error deleting batch transaction:', error);
    return res.status(500).json({ error: 'Something went wrong' });
  }
};

export default withAdminAuthGuard(handler);
