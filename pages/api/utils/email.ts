import {
  emailTransporter,
  hotmailTransporter,
  yahooTransporter,
} from './transporter';
import { User } from '@prisma/client';
import { generateOrderTemplate } from '@/config/email';
import { UserType } from '@/app/utils/type';
import InvoiceDocument from '@/app/admin/[companyId]/components/PDF/InvoiceDocument';
import ReactPDF from '@react-pdf/renderer';
import React from 'react';
import { Order } from '@/app/admin/[companyId]/orders/page';
import nodemailer from 'nodemailer';
import DebtOrders from '@/app/admin/[companyId]/components/PDF/DebtOrders';

const emailHandler = async (
  email: string,
  subject: string,
  title: string,
  template: string,
  cc?: string,
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
        cc,
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
        cc,
      });
    }

    console.log(cc, 'CC');
    await emailTransporter.sendMail({
      from: process.env.NODEMAILER_EMAIL,
      to: email,
      subject: subject,
      text: title,
      html: template,
      ...(cc && typeof cc === 'string' && cc.trim() !== '' ? { cc } : {}),
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

export const sendWelcomeEmail = async (guest: User) => {
  if (!guest.email) {
    return;
  }

  await emailHandler(
    guest.email,
    'Welcome to Supreme Sprouts',
    'Supreme Sprouts Ltd',
    generateWelcomeEmail(guest.clientName),
  );
};

export const generateWelcomeEmail = (clientName: string) => {
  return `
Dear ${clientName},

We hope you're having a fantastic day. At Supreme Sprouts, we’re thrilled to announce some wonderful news—your interest in partnering with us has brought us great joy and excitement!

At Supreme Sprouts, providing the highest quality ingredients is our top priority. We take pride in offering a wide range of vegetables that meet the needs of restaurants, markets, and supermarkets. 
By partnering with us, you’ll have access to fresh, premium produce that will set you apart, helping you attract more customers and grow your business.

We know that your dedication to excellence means we can continue to grow together and deliver even better produce solutions to our customers. 
This collaboration is proof to our shared commitment to quality and innovation in the food industry.

Thank you for choosing Supreme Sprouts. We’re eager to welcome you as part of our expanding family and look forward to working with you to make an impact on the industry.
We’ll be reaching out shortly with more details about how we can collaborate effectively. In the meantime, feel free to reach out if you have any questions or need anything from us.

Best regards,

Tim
Supreme Sprouts Ltd

  `;
};
