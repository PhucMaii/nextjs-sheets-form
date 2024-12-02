import { NextApiRequest, NextApiResponse } from "next";
import emailHandler from "../utils/email";
import withAuthGuard from "../utils/withAuthGuard";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    try {
        if (req.method !== 'POST') {
            return res.status(404).json({
                error: 'Your method is not supported',
            });
        }

        const { email, subject, message } = req.body;

        if (!email || !subject || !message) {
            return res.status(400).json({
                error: 'Email, subject, and message are required',
            });
        }

        await emailHandler(email, subject, message, '');

        return res.status(200).json({
            message: 'Email sent successfully',
        })
    } catch (error: any) {
        console.log('Internal Server Error: ', error);
        return res.status(500).json({
            error: 'Internal Server Error: ' + error,
        });
    }

}

export default withAuthGuard(handler);