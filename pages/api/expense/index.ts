import { google } from "googleapis";
import { NextApiRequest, NextApiResponse } from "next";
import { calculateNextPos } from "./utils";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if(req.method !== "POST") {
        return res.status(500).send("Only Post method allowed");
    }
    const body: SheetForm[] = req.body;
    // const body: SheetForm[] = [
    //     {
    //         sheetName: "MAIN",
    //         row: 5,
    //         revenue: 200,
    //         total: 400,
    //         name: "Bin"
    //     },
    //     {
    //         sheetName: "DELIVERY_APP",
    //         row: 1,
    //         expense: 2000,
    //         revenue: 200,
    //         total: 400,
    //     },
    //     {
    //         sheetName: "MAIN",
    //         row: 1,
    //         expense: 2000,
    //         revenue: 200,
    //         total: 400,
    //     }
    // ]
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
        for (const sheet of body) {
            // Get Sheet Value
            const response = await sheets.spreadsheets.values.get({
                spreadsheetId: process.env.GOOGLE_SHEET_ID,
                range: sheet.sheetName,
            });
            // Calculate next position
            let nextPos: string = '';
            if(response.data.values) {
                if(response.data.values[sheet.row - 1]) {
                    nextPos = calculateNextPos(response.data.values[sheet.row - 1].length, []);
                } else {
                    nextPos = calculateNextPos(0, []);
                }
            }
            const validKeys = Object.keys(sheet).filter((key) => {
                return key !== "sheetName" && key !== "row"
            }) as (keyof SheetForm)[];
            const values = validKeys.map((key) => [sheet[key]]);
            const appendResponse = await sheets.spreadsheets.values.append({
                spreadsheetId: process.env.GOOGLE_SHEET_ID,
                range: `${sheet.sheetName}!${nextPos}${sheet.row}`,
                valueInputOption: "USER_ENTERED",
                requestBody: {
                    values
                }                
            })
            const appendData = appendResponse.data.updates
            data.push(appendData);
        }
        return res.status(200).json({
            data
        })
        
    } catch(error) {
        console.log(error);
    }
}