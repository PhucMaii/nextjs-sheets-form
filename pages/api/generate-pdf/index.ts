import { renderToStream } from '@react-pdf/renderer';
import { NextApiRequest, NextApiResponse } from 'next';
import InvoiceDocument from '../../../app/admin/[companyId]/components/PDF/InvoiceDocument';
import React from 'react';
import withAuthGuard from '../utils/withAuthGuard';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { client, orders, debtData, sortDebtKeys, isOldInvoice } = req.body;

  const invoiceElement: any = React.createElement(InvoiceDocument, {
    client,
    orders,
    debtData: debtData,
    sortDebtKeys,
    isOldInvoice,
  });
  const stream = await renderToStream(invoiceElement);
  res.setHeader('Content-Type', 'application/pdf');
  stream.pipe(res);
};

export default withAuthGuard(handler);
