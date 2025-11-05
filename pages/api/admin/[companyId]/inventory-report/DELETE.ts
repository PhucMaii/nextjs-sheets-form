import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';

interface IQuery {
  reportId?: string;
}

export default async function DELETE(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  try {
    const { reportId }: IQuery = req.query;
    if (!reportId) {
      return res
        .status(400)
        .json({ error: 'Company ID and report ID are required' });
    }

    const existingReport = await prisma.inventoryReport.findUnique({
      where: { id: Number(reportId) },
    });
    if (!existingReport) {
      return res.status(400).json({ error: 'Inventory report not found' });
    }

    await prisma.inventoryReport.delete({
      where: { id: Number(reportId) },
    });

    return res
      .status(200)
      .json({ message: 'Inventory report deleted successfully' });
  } catch (error: any) {
    console.log('Something went wrong while deleting inventory report', error);
    return res
      .status(500)
      .json({ error: 'Something went wrong while deleting inventory report' });
  }
}
