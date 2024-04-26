import { API_URL } from "@/app/utils/enum";
import axios from "axios";
import { NextApiRequest, NextApiResponse } from "next";
import { checkHasClientOrder } from "../import-sheets";
import moment from "moment";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {

        const userOrder: any = await checkHasClientOrder(
            9,
            '04/27/2024',
        );

        const currentDate = new Date();
        const dateString = moment(currentDate).format('YYYY-MM-DD');
        const timeString = moment(currentDate).format('HH:mm:ss');
  
        // Format data to have the same structure as backend
        let submittedData: any = {
          ['DELIVERY DATE']:  '04/28/2024',
          ['NOTE']: 'Phuc test by cron jobs',
          orderTime: `${timeString} ${dateString}`,
        };
  
        for (const item of userOrder.items) {
          submittedData = { ...submittedData, [item.name]: item.quantity };
        }

        await axios.post(
            `https://supremesprouts.com${API_URL.IMPORT_SHEETS}?userId=8`,
            submittedData,
        );

        return res.status(200).json({
            message: 'Cron Job works',
        })
    } catch (error: any) {
        console.log('Internal Server Error: ', error);
        return res.status(500).json({
            error: 'Internal Server Error: ' + error
        })
    }
}