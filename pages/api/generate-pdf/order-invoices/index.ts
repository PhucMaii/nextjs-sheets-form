import { renderToStream } from '@react-pdf/renderer';
import { NextApiRequest, NextApiResponse } from 'next';
import React from 'react';
import withAuthGuard from '../../utils/withAuthGuard';
import DebtOrders from '@/app/admin/[companyId]/components/PDF/DebtOrders';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { orders } = req.body;

  const formattedOrders = orders.map((order: any) => {
    const items = order.items.map((item: any) => ({
      ...item,
      totalPrice: item.quantity * item.price,
    }));

    return {
      ...order,
      items,
    };
  });

  const invoiceElement: any = React.createElement(DebtOrders, {
    debtOrders: formattedOrders,
  });
  const stream = await renderToStream(invoiceElement);
  res.setHeader('Content-Type', 'application/pdf');
  stream.pipe(res);
};

export default withAuthGuard(handler);
