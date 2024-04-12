import { google } from 'googleapis';
import { NextApiRequest, NextApiResponse } from 'next';
import emailHandler from '../utils/email';
import { generateOrderTemplate } from '@/config/email';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';
import { PrismaClient } from '@prisma/client';
import { ORDER_STATUS } from '@/app/utils/enum';
import { sheetStructure } from '@/config/sheetStructure';
import { pusherServer } from '@/app/pusher';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'POST') {
    return res.status(500).send('Only Post method allowed');
  }

  try {
    const prisma = new PrismaClient();
    const session: any = await getServerSession(req, res, authOptions);

    if (!session) {
      return res.status(401).json({ error: 'You are not authenticated' });
    }

    const existingUser = await prisma.user.findUnique({
      where: {
        id: Number(session.user.id),
      },
    });

    if (!existingUser) {
      return res.status(404).json({ error: 'User Not Found in DB' });
    }

    const userCategory = await prisma.category.findUnique({
      where: {
        id: existingUser.categoryId,
      },
    });

    const items = await prisma.item.findMany({
      where: {
        categoryId: existingUser.categoryId,
      },
    });

    const body: any = req.body;
    // Initialize new order
    const newOrder = await prisma.orders.create({
      data: {
        deliveryDate: body['DELIVERY DATE'],
        orderTime: body.orderTime,
        userId: existingUser.id,
        totalPrice: 0,
        note: body['NOTE'],
        status: ORDER_STATUS.INCOMPLETED,
      },
    });

    await prisma.orderPreference.create({
      data: {
        orderId: newOrder.id,
        isAutoPrint: true,
      },
    });

    let totalPrice = 0;
    const itemList: any = [];
    // Loop through each item from request and save it to order
    for (const item of Object.keys(body)) {
      if (item === 'DELIVERY DATE') {
        continue;
      }

      const itemData = await prisma.item.findFirst({
        where: {
          name: item,
          categoryId: existingUser.categoryId,
        },
      });

      if (itemData) {
        totalPrice += itemData.price * body[item];
        const orderedItems = await prisma.orderedItems.create({
          data: {
            name: itemData.name,
            price: itemData.price,
            orderId: newOrder.id,
            quantity: body[item],
          },
        });

        itemList.push({
          ...orderedItems,
          totalPrice: itemData.price * body[item],
        });
      }
    }

    // Update the order with the totalPrice
    await prisma.orders.update({
      where: {
        id: newOrder.id,
      },
      data: {
        totalPrice,
      },
    });

    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      },
      scopes: [
        'https://www.googleapis.com/auth/drive',
        'https://www.googleapis.com/auth/drive.file',
        'https://www.googleapis.com/auth/spreadsheets',
      ],
    });
    const sheets = google.sheets({
      auth,
      version: 'v4',
    });

    const data = [];
    // format data to append into client sheet
    // make a copy of sheet structure to avoid changed on formatted values affect sheet structure
    const formattedValues: any[] = [...sheetStructure];
    Object.keys(body).forEach((key) => {
      const keyStructureIndex = sheetStructure.indexOf(key);
      if (keyStructureIndex === -1) {
        return;
      }

      let validValue = body[key];
      if (key === 'DELIVERY DATE') {
        formattedValues[keyStructureIndex] = validValue;
        return;
      }

      validValue = parseInt(validValue);
      formattedValues[keyStructureIndex] = validValue;
    });

    // Turn all non-value field into 0
    for (let i = 1; i < formattedValues.length; i++) {
      if (typeof formattedValues[i] === 'string') {
        formattedValues[i] = 0;
      }
    }

    pusherServer.trigger('admin', 'incoming-order', {
      items: itemList,
      ...existingUser,
      ...newOrder,
      totalPrice,
      category: userCategory,
    });

    // Append to Client Sheet
    const appendResponse = await sheets.spreadsheets.values.append({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range: `${existingUser.sheetName}!A1:I1`,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [formattedValues],
      },
    });
    const appendData = appendResponse.data.updates;
    data.push(appendData);

    // format data to append into overview sheet
    const [date, ...restValues] = formattedValues;
    const overviewFormattedData = [
      date,
      newOrder.id,
      existingUser.clientId.toString(),
      existingUser.clientName,
      ...restValues,
    ];

    // Append to Overview Sheet
    await sheets.spreadsheets.values.append({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range: `Overview!A1:L1`,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [overviewFormattedData],
      },
    });

    // Generate object of quantity, price, and totalPrice
    const orderDetails = body;
    for (const item of items) {
      if (Object.prototype.hasOwnProperty.call(body, item.name)) {
        orderDetails[item.name] = {
          quantity: orderDetails[item.name],
          price: item.price,
          totalPrice: orderDetails[item.name] * item.price,
        };
      }
    }

    // Notify Email
    const emailSendTo: any = process.env.NODEMAILER_EMAIL;
    const htmlTemplate: string = generateOrderTemplate(
      existingUser.clientName,
      existingUser.clientId,
      orderDetails,
      existingUser.contactNumber,
      existingUser.deliveryAddress,
      newOrder.id,
    );

    await emailHandler(
      emailSendTo,
      'Order Supreme Sprouts',
      'Supreme Sprouts LTD',
      htmlTemplate,
    );

    return res.status(200).json({
      overviewFormattedData,
      message: 'Data Added Successfully',
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      error: 'Internal Server Error: ' + error,
    });
  }
};

export default handler;
