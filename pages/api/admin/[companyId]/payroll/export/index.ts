import PayrollPDF from '@/app/admin/[companyId]/components/PDF/PayrollPDF';
import { generateListOfDateString } from '@/app/utils/time';
import prisma from '@/client';
import { formatDate } from '@/pages/api/utils/date';
import withAdminAuthGuard from '@/pages/api/utils/withAdminAuthGuard';
import { renderToStream } from '@react-pdf/renderer';
import { NextApiRequest, NextApiResponse } from 'next';
import React from 'react';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { companyId, startDate, endDate } = req.query;

  if (!companyId || !startDate || !endDate) {
    return res.status(400).json({ error: 'Missing required parameters' });
  }

  const formattedStartDate = formatDate(startDate as string);
  const formattedEndDate = formatDate(endDate as string);

  const listOfDateString = generateListOfDateString(
    formattedStartDate,
    formattedEndDate,
  );

  const payrolls: any = await prisma.payroll.findMany({
    where: {
      companyId: Number(companyId),
      OR: [
        {
          startDate: {
            in: listOfDateString,
          },
        },
        {
          endDate: {
            in: listOfDateString,
          },
        },
      ],
    },
    include: {
      employee: true,
    },
  });

  const { yyyymmddStartDate, yyyymmddEndDate } = req.body;

  const payrollElement: any = React.createElement(PayrollPDF, {
    payrolls,
    startDate: yyyymmddStartDate,
    endDate: yyyymmddEndDate,
  });

  const stream = await renderToStream(payrollElement);

  res.setHeader('Content-Type', 'application/pdf');
  stream.pipe(res);
};

export default withAdminAuthGuard(handler);
