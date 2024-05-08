import { transporter } from './transporter';
import { OrderedItems, User } from '@prisma/client';
import { generateOrderTemplate } from '@/config/email';
import { generateCurrentTime } from '@/app/utils/time';

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
  user: User,
  items: OrderedItems[],
  invoiceId: number,
  deliveryDate: string,
  sendToAdmin: boolean,
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
