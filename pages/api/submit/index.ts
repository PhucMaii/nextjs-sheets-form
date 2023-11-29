import { google } from "googleapis";
import { NextApiRequest, NextApiResponse } from "next";

type SheetForm = {
    name: string
    email: string
    phoneNumber: string
    message: string
}
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if(req.method !== "POST") {
        return res.status(405).send("Only allowed POST method");
    }
    const body = req.body as SheetForm;
    try {
        const auth = new google.auth.GoogleAuth({
            credentials: {
                client_email: process.env.GOOGLE_CLIENT_EMAIL,
                private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n')
            },
            scopes: [
                'https://www.googleapis.com/auth/drive',
                'https://www.googleapis.com/auth/drive.file',
                'https://www.googleapis.com/auth/spreadsheets'
            ]
        })
        const sheets = google.sheets({
            auth,
            version: 'v4'
        })
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: process.env.GOOGLE_SHEET_ID,
            range: "Sheet1",
        });
        console.log(response.data.values);
        const columns = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
        const numCols = response.data.values ? response.data.values[0].length : 0;
        const range = `Sheet1!B5:B8`;

        const appendResponse = await sheets.spreadsheets.values.append({
            spreadsheetId: process.env.GOOGLE_SHEET_ID,
            range, // Assuming you want to start appending from C5
            valueInputOption: "USER_ENTERED",
            requestBody: {
              values: [[body.name], [body.email], [body.phoneNumber], [body.message]],
            },
        });
        return res.status(200).json({
            data: appendResponse.data
        })

    } catch(error) {
        console.log(error);
        return res.status(500).send({message: "Something went wrong"})
    }

} 