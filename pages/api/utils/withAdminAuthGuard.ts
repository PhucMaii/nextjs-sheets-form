import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';
import { PrismaClient } from '@prisma/client';
import { USER_ROLE } from '@/app/utils/enum';

type HandlerFunction = (
  req: NextApiRequest,
  res: NextApiResponse,
) => Promise<any>;

const withAdminAuthGuard =
  <T extends HandlerFunction>(
    handler: T,
    isSuperAdminPrivilege: boolean = false,
  ) =>
  async (req: NextApiRequest, res: NextApiResponse) => {
    try {
      const prisma = new PrismaClient();

      const session: any = await getServerSession(req, res, authOptions);
      // console.log(session, 'session');

      if (!session) {
        return res.status(401).json({ error: 'You are not authenticated' });
      }

      const existingAdmin = await prisma.employee.findUnique({
        where: {
          id: Number(session.user.id),
        },
      });

      // console.log(existingAdmin, 'existingAdmin');

      if (!existingAdmin) {
        return res.status(404).json({ error: 'User Not Found in DB' });
      }

      if (existingAdmin.role === USER_ROLE.DRIVER || existingAdmin.role === USER_ROLE.WAREHOUSE) {
        return res
          .status(404)
          .json({ error: 'You are not authorized to access' });
      }

      // console.log(existingAdmin.role, 'existingAdmin.role');

      if (
        isSuperAdminPrivilege &&
        existingAdmin.role !== USER_ROLE.SUPER_ADMIN
      ) {
        return res
          .status(404)
          .json({ error: 'You are not authorized to access' });
      }

      // console.log('passed');

      return await handler(req, res);
    } catch (error: any) {
      console.log('Internal Server Error in checking auth', error);
      return res.status(500).json({
        error: 'Internal Server Error: ' + error,
      });
    }
  };

export default withAdminAuthGuard;
