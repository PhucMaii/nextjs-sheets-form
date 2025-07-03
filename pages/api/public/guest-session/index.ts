import { NextApiRequest, NextApiResponse } from 'next';
import {
  generateGuestSessionId,
  generateSessionSignature,
} from '@/app/utils/security';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  try {
    if (req.method !== 'POST') {
      return res.status(404).json({
        error: 'Your method is not supported',
      });
    }

    const guestSessionId = generateGuestSessionId();
    const guestSessionSignature = generateSessionSignature(guestSessionId);

    return res.status(200).json({
      guestSessionId,
      guestSessionSignature,
      message: 'Create Guest Session Id Successfully',
    });
  } catch (error: any) {
    console.log('Internal Server Error: ', error);
    return res.status(500).json({
      error: 'Internal Server Error: ' + error,
    });
  }
}
