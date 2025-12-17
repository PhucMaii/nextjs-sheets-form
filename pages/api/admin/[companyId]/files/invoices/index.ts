import { NextApiRequest, NextApiResponse } from 'next';
import { errorResponse } from '@/pages/api/utils/response';
import { normalizeDate } from '@/pages/api/utils/date';
import { generateListOfDateString } from '@/app/utils/time';
import { EvidenceType } from '@prisma/client';
import prisma from '@/client';
import withAdminAuthGuard from '@/pages/api/utils/withAdminAuthGuard';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const { companyId, startDate, endDate } = req.query;

    if (!companyId || !startDate || !endDate) {
      return res
        .status(400)
        .json({ error: 'Company ID, startDate and endDate are required' });
    }

    const normalizedStartDate = normalizeDate(new Date(startDate as string));
    const normalizedEndDate = normalizeDate(new Date(endDate as string));

    const listOfDateString = generateListOfDateString(
      normalizedStartDate,
      normalizedEndDate,
    );
    

    const query: any = {
      companyId: Number(companyId),
      evidenceType: EvidenceType.BILL,
      expense: {
        date: {
          in: listOfDateString,
        },
      },
    };

    // Get all the evidence type BILL from medias
    const invoices = await prisma.media.findMany({
      where: {
        ...query,
      },
      include: {
        expense: {
          include: {
            vendors: true,
          },
        },
      },
    });

    // Format the invoices with the vendor id
    const formattedInvoices = invoices.map((invoice: any) => ({
      ...invoice,
      vendorId: invoice.expense?.vendors?.[0]?.vendorId,
    }));

    console.log(formattedInvoices);

    return res.status(200).json({
      data: formattedInvoices,
      message: 'Invoices fetched successfully',
    });
  } catch (error: any) {
    console.log('Internal Server Error', error);
    return errorResponse(res, error);
  }
};

export default withAdminAuthGuard(handler);
