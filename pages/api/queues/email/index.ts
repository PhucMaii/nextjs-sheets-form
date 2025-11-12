import { NextApiRequest, NextApiResponse } from 'next';
import { sendEmail } from '../../utils/email';
import { verifySignature } from '@upstash/qstash/nextjs';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    const { user, order, orderId, deliveryDate, note, subjectTag } = req.body;
    if (!user || !order || !orderId || !deliveryDate || !note || !subjectTag) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    await sendEmail(user, order, orderId, deliveryDate, true, note, subjectTag);

    return res.status(200).json({ message: 'Email sent successfully' });
  } catch (error) {
    console.error('Error processing email queue:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export default verifySignature(handler, {
  currentSigningKey: process.env.QSTASH_CURRENT_SIGNING_KEY!,
  nextSigningKey: process.env.QSTASH_NEXT_SIGNING_KEY!,
});
