import { google } from 'googleapis';
import { NextApiRequest, NextApiResponse } from 'next';
import { SheetForm } from './type';
import withAuthGuard from '../utils/withAuthGuard';
import getSheet from '../utils/getSheet';
import emailHandler from '../utils/email';
import { generateOrderTemplate } from '@/config/email';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'POST') {
    return res.status(500).send('Only Post method allowed');
  }
  const body: SheetForm[] = req.body;
  try {
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
    for (const sheet of body) {
      const validKeys = Object.keys(sheet).filter((key) => {
        return key !== 'sheetName' && key !== 'row';
      }) as (keyof SheetForm)[];
      const values = validKeys.map((key) => sheet[key]);
      const appendResponse = await sheets.spreadsheets.values.append({
        spreadsheetId: process.env.GOOGLE_SHEET_ID,
        range: 'A1:I1',
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values: [values],
        },
      });
      const appendData = appendResponse.data.updates;
      data.push(appendData);
    }

    // Notify Email
    const clientData: any = await getSheet(body[0].sheetName);
    const emailSendTo: any = process.env.NODEMAILER_EMAIL;
    const htmlTemplate: string = generateOrderTemplate(
      clientData.clientName,
      clientData.clientId,
      body[0],
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

export default withAuthGuard(handler);
