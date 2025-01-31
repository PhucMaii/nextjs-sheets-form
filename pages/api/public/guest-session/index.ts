import { NextApiRequest, NextApiResponse } from 'next';
import { generateGuestSessionId, generateSessionSignature } from '@/app/utils/security';
import {
  IronSessionWithSessionData,
  sessionOptions,
} from '../../utils/session';
import { withIronSession } from 'next-iron-session';

export default withIronSession(
  async (
    req: NextApiRequest & { session: IronSessionWithSessionData },
    res: NextApiResponse,
  ) => {
    try {
      if (req.method !== 'POST') {
        return res.status(404).json({
          error: 'Your method is not supported',
        });
      }

      const password: string | undefined = process.env.TOKEN_SECRET;

      if (!password) {
        return res.status(500).json({
          error: 'Token Secret not found in environment variables',
        });
      }

      // Generate a guest session ID (or use an existing one)
      const guestSessionId =
        req.session.guestSessionId || generateGuestSessionId();
      
      
      const guestSessionSignature = generateSessionSignature(guestSessionId);
      // Save the guest session ID in the session
      req.session.guestSessionId = guestSessionId;
      await req.session.save();

      return res.status(200).json({ 
        guestSessionId,
        guestSessionSignature, 
        message: 'Get Guest Session Id Successfully' 
      });
    } catch (error: any) {
      console.log('Internal Server Error: ', error);
      return res.status(500).json({
        error: 'Internal Server Error: ' + error.message,
      });
    }
  },
  sessionOptions,
);
