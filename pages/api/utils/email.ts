import { transporter } from './transporter';
import { User } from '@prisma/client';
import { generateOrderTemplate } from '@/config/email';
import { generateCurrentTime } from '@/app/utils/time';
import { OrderedItems, UserType } from '@/app/utils/type';
import { OrderedItems as PrismaOrderdItems } from '@prisma/client';
import InvoiceDocument from '@/app/admin/components/PDF/InvoiceDocument';
import ReactPDF from '@react-pdf/renderer';
import React from 'react';
import { Order } from '@/app/admin/orders/page';
import nodemailer from 'nodemailer';

const emailHandler = async (
  email: string,
  subject: string,
  title: string,
  template: string,
) => {
  try {
    await transporter.sendMail({
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
  items: OrderedItems[] | PrismaOrderdItems[],
  invoiceId: number,
  deliveryDate: string,
  sendToAdmin: boolean,
  note = '',
) => {
  const orderDetails: any = {};
  for (const item of items) {
    orderDetails[item.name] = {
      quantity: item.quantity,
      price: item.price,
      totalPrice: item.quantity * item.price,
    };
  }

  const orderTime = generateCurrentTime();

  orderDetails['DELIVERY DATE'] = deliveryDate;
  orderDetails['NOTE'] = note;
  orderDetails.orderTime = orderTime;

  const htmlTemplate: string = generateOrderTemplate(
    user.clientName,
    user.clientId,
    orderDetails,
    user.contactNumber,
    user.deliveryAddress,
    invoiceId,
  );

  if (sendToAdmin) {
    const emailSendTo: any = process.env.NODEMAILER_EMAIL;
    await emailHandler(
      emailSendTo,
      'Order Supreme Sprouts',
      'Supreme Sprouts LTD',
      htmlTemplate,
    );
  }

  if (user.email) {
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
  const element: any = React.createElement(InvoiceDocument, {
    client,
    orders,
    debtData,
    sortDebtKeys,
  });
  const pdfStream = await ReactPDF.renderToStream(element);

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
    to: 'binmaiforwork@gmail.com',
    subject: 'Invoice from Supreme Sprouts Ltd.',
    text: invoiceEmail,
    attachments: [
      {
        filename: `${client.clientName}-invoice.pdf`,
        content: pdfStream,
        contentType: 'application/pdf',
      },
    ],
  };

  await transporter.sendMail(mailOptions);
};

const generateInvoiceEmail = (clientName: string) => {
  return `
    Dear ${clientName},

We hope this message finds you well.

We are pleased to inform you that your invoice from Supreme Sprouts Ltd. is now ready. You can find the attached invoice file below for your review.

If you have any questions or require further assistance, please do not hesitate to contact us.

Thank you for your business.

Best regards,

Tim
Supreme Sprouts Ltd.
  `
}