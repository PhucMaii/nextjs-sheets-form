import { google } from 'googleapis';
import { NextApiRequest, NextApiResponse } from 'next';
import withAuthGuard from '../utils/withAuthGuard';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';
import { PrismaClient } from '@prisma/client';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'GET') {
    return res.status(401).send('Only GET method is allowed');
  }
  try {
    const prisma = new PrismaClient();
    const session: any = await getServerSession(req, res, authOptions);
    
    const user: any = await prisma.user.findUnique({
        where: {
          id: Number(session.user.id),
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

    const response = await sheets.spreadsheets.get({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
    });

    const sheetsData: any = response.data.sheets;

    // Binary Search to find client sheet based on id 
    let left = 0;
    let right = sheetsData.length - 1;
    let returnData;

    while (left < right) {
        const mid = Math.floor((right + left) / 2);

        const range = `${sheetsData[mid].properties.title}!A2:A2`;
        const sheetData = await sheets.spreadsheets.values.get({
            spreadsheetId: process.env.GOOGLE_SHEET_ID,
            range 
        });
        const values: any = sheetData.data.values;

        if (parseInt(values[0][0]) === parseInt(user.clientId)) {
            returnData = sheetData;
            return;
        } else if (parseInt(values[0][0]) < parseInt(user.clientId)) {
            right = mid - 1;
        } else {
            left = mid + 1;
        }
    }

    // for (let i = 0; i < sheetsData.length; i++) {
    //     const range = `${sheetsData[i].properties.title}!A2:A2`;
    //     const sheetData = await sheets.spreadsheets.values.get({
    //         spreadsheetId: process.env.GOOGLE_SHEET_ID,
    //         range 
    //     });

    //     const values: any = sheetData.data.values;
    //     console.log(values[0][0], 'values');
    //     return res.status(200).json({
    //         data: values[0][0],
    //         message: 'Data Fetched Successfully',
    //       });
    //     if (values && values.length > 0 && values[0][0]) {
    //         listOfValues.push(values[0][0]);
    //     }
    // }

    console.log(returnData, 'Return Data');

    return res.status(200).json({
      data: returnData,
      message: 'Data Fetched Successfully',
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({error: 'Internal Server Error: ' + error})
  }
};

export default withAuthGuard(handler);
