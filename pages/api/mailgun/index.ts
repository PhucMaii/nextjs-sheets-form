import type { NextApiRequest, NextApiResponse } from 'next';
import { sendEmail } from '../utils/mailgun';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== 'POST') return res.status(405).end();

  const { to, subject, text } = req.body;

  try {
    const result = await sendEmail(to, subject, text);
    res.status(200).json({ success: true, result });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to send email' });
  }
}
