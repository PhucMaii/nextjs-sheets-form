import { google } from 'googleapis';

const getSheet = async (sheetName: string) => {
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

    const range = `${sheetName}!A1:Z2`;
    const sheetData = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range,
    });

    const returnData: any = sheetData.data.values;

    return {
      clientName: returnData[0][1],
      clientId: returnData[1][0],
      contactNumber: returnData[0][4],
      deliveryAddress: returnData[0][5],
    };
  } catch (error) {
    console.log(error);
  }
};

export default getSheet;
