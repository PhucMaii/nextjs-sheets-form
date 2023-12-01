import { google } from "googleapis";
import { NextApiRequest, NextApiResponse } from "next";

interface SheetForm  {
    sheetName: string
    row: number
    expense: number
    revenue: number
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if(req.method !== "POST") {
        return res.status(500).send("Only Post method allowed");
    }
    const body: Array<SheetForm> = req.body;
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

        const data = []; 
        // console.log(calculateCurrentPos(800, data), "Current Position");
        for (const sheet of body) {
            const response = await sheets.spreadsheets.values.get({
                spreadsheetId: process.env.GOOGLE_SHEET_ID,
                range: sheet.sheetName, // Assuming you want to retrieve all data from columns B to E
            });
            let nextPos: string = '';
            if(response.data.values) {
                nextPos = calculateCurrentPos(response.data.values[sheet.row - 1].length, []);
            }
            const appendResponse = await sheets.spreadsheets.values.append({
                spreadsheetId: process.env.GOOGLE_SHEET_ID,
                range: `${sheet.sheetName}!${nextPos}${sheet.row}`,
                valueInputOption: "USER_ENTERED",
                requestBody: {
                    values: [
                        [sheet.expense?.toString()],
                        [sheet.revenue?.toString()]
                    ]
                }                
            })
            data.push(appendResponse.data);
        }
        return res.status(200).json({
            data
        })
        
    } catch(error) {
        console.log(error);
    }
}


function calculateCurrentPos(currentPos: number, result: string[]) {
    const columns = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'; 
    if(currentPos < columns.length) {
        return columns[currentPos];
    }
    result.unshift(columns[currentPos % columns.length]);
    currentPos = Math.floor(currentPos / columns.length) - 1; 
    if(currentPos < columns.length) {
        result.unshift(columns[currentPos])
        return result.join('');
    } 
    return calculateCurrentPos(currentPos, result);
}