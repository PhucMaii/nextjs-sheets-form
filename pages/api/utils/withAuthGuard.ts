import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';
import { USER_ROLE } from '@/app/utils/enum';
import prisma from '@/client';

type HandlerFunction = (
  req: NextApiRequest,
  res: NextApiResponse,
) => Promise<any>;

const withAuthGuard =
  <T extends HandlerFunction>(handler: T) =>
  async (req: NextApiRequest, res: NextApiResponse) => {
    try {
      const session: any = await getServerSession(req, res, authOptions);

      if (!session) {
        return res.status(401).json({ error: 'You are not authenticated' });
      }

      const existingUser = await prisma.user.findUnique({
        where: {
          id: Number(session.user.id),
        },
      });

      const driver = await prisma.employee.findUnique({
        where: {
          id: Number(session.user.id),
          role: USER_ROLE.DRIVER,
        },
      });

      if (!existingUser && !driver) {
        return res.status(404).json({ error: 'User Not Found in DB' });
      }

      return await handler(req, res);
    } catch (error: any) {
      console.log('Internal Server Error in checking auth', error);
      return res.status(500).json({
        error: 'Internal Server Error: ' + error,
      });
    }
  };

export default withAuthGuard;
