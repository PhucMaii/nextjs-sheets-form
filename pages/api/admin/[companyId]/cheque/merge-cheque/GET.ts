import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/client';

interface IQuery {
  vendorId?: string;
  year?: string;
}

export default async function GET(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { companyId } = req.query;
    const {
      vendorId,
      year,
    }: IQuery = req.query;

    if (!companyId) {
      return res.status(400).json({ error: 'Company ID is required' });
    }

    if (!vendorId || !year) {
      return res.status(400).json({ error: 'Vendor ID, start date and end date are required' });
    }

    const mergeCheques = await prisma.cheque.findMany({
      where: {
        companyId: Number(companyId),
        vendorId: Number(vendorId),
        startDate: {
          contains: year,
        },
        endDate: {
          contains: year,
        },
      },
      include: {
        vendor: true,
        transactions: true,
      },
    });

    return res.status(200).json({
      data: mergeCheques,
      message: 'Fetch Merge Cheques Successfully',
    });
  } catch (error) {
    console.log('Internal Server Error: ', error);
    return res.status(500).json({ error: 'Internal Server Error: ' + error });
  }
}
