import {
  emailTransporter,
  hotmailTransporter,
  yahooTransporter,
} from './transporter';
import { User } from '@prisma/client';
import { generateOrderTemplate } from '@/config/email';
import { UserType } from '@/app/utils/type';
import InvoiceDocument from '@/app/admin/components/PDF/InvoiceDocument';
import ReactPDF from '@react-pdf/renderer';
import React from 'react';
import { Order } from '@/app/admin/orders/page';
import nodemailer from 'nodemailer';
import DebtOrders from '@/app/admin/components/PDF/DebtOrders';

const emailHandler = async (
  email: string,
  subject: string,
  title: string,
  template: string,
) => {
  try {
    console.log(
      { email, includesYahoo: email.includes('@yahoo.com') },
      'EMAIL',
    );
    if (email.includes('@yahoo.ca') || email.includes('@yahoo.com')) {
      await yahooTransporter.sendMail({
        from: process.env.NODEMAILER_EMAIL,
        to: email,
        subject: subject,
        text: title,
        html: template,
      });
      return;
    }

    if (
      email.includes('@hotmail.com') ||
      email.includes('@hotmail.com') ||
      email.includes('@outlook.com')
    ) {
      await hotmailTransporter.sendMail({
        from: process.env.NODEMAILER_EMAIL,
        to: email,
        subject: subject,
        text: title,
        html: template,
      });
    }

    await emailTransporter.sendMail({
      from: process.env.NODEMAILER_EMAIL,
      to: email,
      subject: subject,
      text: title,
      html: template,
    });
  } catch (error) {
    console.log('Fail to send email, ', error);
  }
};

export default emailHandler;

export const sendEmail = async (
  user: User | UserType,
  // items: OrderedItems[] | PrismaOrderdItems[],
  order: any,
  invoiceId: number,
  deliveryDate: string,
  sendToAdmin: boolean,
  note = '',
) => {
  // const orderDetails: any = {};
  // for (const item of items) {
  //   orderDetails[item.name] = {
  //     quantity: item.quantity,
  //     price: item.price,
  //     totalPrice: item.quantity * item.price,
  //   };
  // }

  // const orderTime = generateCurrentTime();

  // orderDetails['DELIVERY DATE'] = deliveryDate;
  // orderDetails['NOTE'] = note;
  // orderDetails.orderTime = orderTime;

  const htmlTemplate: string = generateOrderTemplate(
    user.clientName,
    user.clientId,
    { ...order, note, deliveryDate },
    user.contactNumber,
    user.deliveryAddress,
    invoiceId,
  );

  const isToAdmin =
    process.env.NEXT_PUBLIC_CURRENT_STATE === 'development'
      ? false
      : sendToAdmin;

  if (isToAdmin) {
    const emailSendTo: any = process.env.NODEMAILER_EMAIL;
    await emailHandler(
      emailSendTo,
      'Order Supreme Sprouts',
      'Supreme Sprouts LTD',
      htmlTemplate,
    );
  }

  if (user?.email && !user.email.includes('INACTIVE')) {
    await emailHandler(
      user.email,
      'Order Supreme Sprouts',
      'Supreme Sprouts LTD',
      htmlTemplate,
    );
  }
};

export const sendInvoiceThroughEmail = async (
  client: UserType,
  orders: Order[],
  debtData: any,
  sortDebtKeys: any,
) => {
  const invoiceElement: any = React.createElement(InvoiceDocument, {
    client,
    orders,
    debtData: debtData.overview,
    sortDebtKeys,
  });
  const debtOrdersElement: any = React.createElement(DebtOrders, {
    debtOrders: debtData.debtOrders,
  });

  const invoicePdfStream = await ReactPDF.renderToStream(invoiceElement);
  const debtOrdersPdfStream = await ReactPDF.renderToStream(debtOrdersElement);

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.NODEMAILER_EMAIL,
      pass: process.env.NODEMAILER_PASSWORD,
    },
  });

  const invoiceEmail = generateInvoiceEmail(client.clientName);

  const mailOptions: any = {
    from: process.env.NODEMAILER_EMAIL,
    to: client?.email,
    subject: 'Invoice from Supreme Sprouts Ltd.',
    text: invoiceEmail,
    attachments: [
      {
        filename: `${client.clientName}-invoice.pdf`,
        content: invoicePdfStream,
        contentType: 'application/pdf',
      },
      {
        filename: `${client.clientName}-debt-orders.pdf`,
        content: debtOrdersPdfStream,
        contentType: 'application/pdf',
      },
    ],
  };

  await transporter.sendMail(mailOptions);
};

export const generateInvoiceEmail = (clientName: string) => {
  return `
    Dear ${clientName},

We hope this message finds you well.

We are pleased to inform you that your invoice from Supreme Sprouts Ltd. is now ready. You can find the attached invoice file below for your review.

If you have any questions or require further assistance, please do not hesitate to contact us.

Thank you for your business.

Best regards,

Tim
Supreme Sprouts Ltd.

Please send your payment by cheque to:
Unit 1 - 6420 Beresford Street Burnaby, 
British Columbia V5E 1B6, Canada
if we are unable to collect it in person.
Thank you for your cooperation.
  `;
};
