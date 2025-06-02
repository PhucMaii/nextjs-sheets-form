import { renderToStream } from '@react-pdf/renderer';
import { NextApiRequest, NextApiResponse } from 'next';
import React from 'react';
import Quote from '@/app/admin/[companyId]/components/PDF/Quote';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const { quote } = req.body;
  console.log({ quote });

  const quoteElement: any = React.createElement(Quote, {
    quote,
  });
  const stream = await renderToStream(quoteElement);
  res.setHeader('Content-Type', 'application/pdf');
  stream.pipe(res);
}
