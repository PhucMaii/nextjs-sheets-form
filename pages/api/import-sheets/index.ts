import { google } from 'googleapis';
import { NextApiRequest, NextApiResponse } from 'next';
import getSheet, { ClientData } from '../utils/getSheet';
import emailHandler from '../utils/email';
import { generateOrderTemplate } from '@/config/email';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';
import { PrismaClient } from '@prisma/client';

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

    const body: any = req.body;
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
    const formattedValues = Object.keys(body).map((key) => body[key]);
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

    // Notify Email
    const clientData = await getSheet(existingUser.sheetName) as ClientData;
    const emailSendTo: any = process.env.NODEMAILER_EMAIL;
    const htmlTemplate: string = generateOrderTemplate(
      clientData.clientName,
      clientData.clientId,
      body,
      clientData.contactNumber,
      clientData.deliveryAddress,
    );

    await emailHandler(
      emailSendTo,
      'TEST: Order Supreme Sprouts',
      'Supreme Sprouts LTD',
      htmlTemplate,
    );

    return res.status(200).json({
      data,
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
