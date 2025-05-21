import { renderToStream } from '@react-pdf/renderer';
import { NextApiRequest, NextApiResponse } from 'next';
import InvoiceDocument from '../../../app/admin/[companyId]/components/PDF/InvoiceDocument';
import React from 'react';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const { client, orders, debtData, sortDebtKeys, isOldInvoice } = req.body;
  console.log({ client, orders, debtData, sortDebtKeys, isOldInvoice });

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
}
