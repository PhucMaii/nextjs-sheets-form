import {
  emailTransporter,
  hotmailTransporter,
  yahooTransporter,
} from './transporter';
import { User } from '@prisma/client';
import { generateOrderTemplate, TimFooter } from '@/config/email';
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
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; color: #333;">
      <h2 style="text-align: center; background-color: #5cb85c; color: white; padding: 10px; border-radius: 5px;">Welcome to Supreme Sprouts!</h2>

      <p>Dear ${clientName},</p>

      <p>We hope you're having a fantastic day! At <strong>Supreme Sprouts</strong>, we’re thrilled to welcome you and explore the opportunity of working together.</p>

      <p>We take great pride in providing the highest quality vegetables to restaurants, markets, and supermarkets. By joining forces with us, you’ll have access to fresh, premium produce that helps you stand out and attract more customers.</p>

      <p>Your dedication to excellence aligns perfectly with our values, and we believe this collaboration will lead to something truly impactful in the food industry.</p>

      <p>Thank you for considering Supreme Sprouts as your partner. We're excited to have you as part of our growing family and will be reaching out shortly with more details on how we can work together effectively.</p>

      <p>In the meantime, if you have any questions or need anything at all, don’t hesitate to reach out. We’re here to help.</p>

      <p>Warm regards,</p>

      ${TimFooter}
    </div>
  `;
};


export const generateApproveToBePartnerEmail = (
  user: User
) => {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; color: #333;">
      <h2 style="text-align: center;  background-color: #5cb85c; color: white; padding: 10px; border-radius: 5px;">Welcome to the Supreme Sprouts Family!</h2>
      
      <p>Dear ${user.clientName},</p>

      <p>We’re excited to officially welcome you as a valued partner of <strong>Supreme Sprouts Ltd</strong>. Your partnership means a lot to us, and we’re looking forward to growing together!</p>

      <p>To help you get started, we’ve created an account for you on our partner platform, where you can access to our wholesale price, easily place orders, manage your orders, and manage your profile.</p>

      <h3>Your Login Credentials:</h3>
      <ul style="line-height: 1.8;">
        <li><strong>Client ID:</strong> ${user.clientId}</li>
        <li><strong>Password:</strong> ${user?.contactNumber || 'welcomeToOurApp'}</li>
        <li><strong>Login URL:</strong> <a href="https://supremesprouts.com/account/login" target="_blank">https://supremesprouts.com/account/login</a></li>
      </ul>

      <p>For security reasons, we recommend logging in and updating your password as soon as possible.</p>

      <p>Should you have any questions or need assistance, our team is always here to help. We’re committed to making your experience with Supreme Sprouts seamless, efficient, and rewarding.</p>

      <p>Once again, thank you for joining us. We’re proud to partner with you and can’t wait to support your growth with the freshest, most reliable produce available.</p>

      <p>Warm regards,</p>

      ${TimFooter}
    </div>
  `;
};