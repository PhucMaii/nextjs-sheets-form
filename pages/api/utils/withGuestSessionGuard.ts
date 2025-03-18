import { NextApiRequest, NextApiResponse } from 'next';
import { HandlerFunction } from './withDriverAuthGuar';
import { verifySessionId } from '@/app/utils/security';

export const withGuestSessionGuard =
  <T extends HandlerFunction>(handler: T) =>
  async (req: NextApiRequest, res: NextApiResponse) => {
    try {
      const { guestSessionId, guestSessionSignature } = req.body;

      if (!guestSessionId || !guestSessionSignature) {
        return res.status(401).json({ error: 'You are not authenticated' });
      }

      // Verify Guest Session
      const isGuestSessionValid = verifySessionId(
        guestSessionId,
        guestSessionSignature,
      );

      if (!isGuestSessionValid) {
        return res
          .status(401)
          .json({
            error:
              'Your session is not valid currently. Please try again later',
          });
      }

      return await handler(req, res);
    } catch (error: any) {
      console.log('Internal Server Error: ', error);
      return res.status(500).json({ error: 'Internal Server Error: ' + error });
    }
  };
