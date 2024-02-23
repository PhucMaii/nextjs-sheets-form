import { google } from 'googleapis';

const getSheet = async (clientId: string) => {
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

    const response = await sheets.spreadsheets.get({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
    });

    const sheetsData: any = response.data.sheets;

    // Binary Search to find client sheet based on id 
    let left = 0;
    let right = sheetsData.length - 1;
    let returnData: any = [];

    while (left < right) {
        const mid = Math.floor((right + left) / 2) - 1; // index start at 0
        
        const range = `${sheetsData[mid].properties.title}!A1:Z2`;
        const sheetData = await sheets.spreadsheets.values.get({
          spreadsheetId: process.env.GOOGLE_SHEET_ID,
          range 
        });
        const values: any = sheetData.data.values;

        if (parseInt(values[1][0]) === parseInt(clientId)) {
            returnData = sheetData.data.values;
            break;
        } else if (parseInt(values[1][0]) < parseInt(clientId)) {
            right = mid - 1;
        } else {
            left = mid + 1;
        }
    }

    return {
      clientName: returnData[0][1],
      contactNumber: returnData[0][4],
      deliveryAddress: returnData[0][5]
    };
  } catch (error) {
    console.log(error);
  }
};

export default getSheet;