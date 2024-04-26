import { PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';
import bcrypt from 'bcrypt';

interface BodyTypes {
  oldPassword?: string;
  newPassword?: string;
  email?: string;
}

export default async function PUT(req: NextApiRequest, res: NextApiResponse) {
  try {
    const prisma = new PrismaClient();
    const { oldPassword, newPassword, email }: BodyTypes = req.body;

    const session: any = await getServerSession(req, res, authOptions);

    if (!session) {
      return res.status(401).json({ error: 'You are not authenticated' });
    }

    const existingUser = await prisma.user.findUnique({
      where: {
        id: Number(session.user.id),
      },
    });

    if (!existingUser) {
      return res.status(404).json({ error: 'User Not Found in DB' });
    }

    if (oldPassword && newPassword) {
      const isOldPasswordMatch = await bcrypt.compare(
        oldPassword,
        existingUser.password,
      );
      if (!isOldPasswordMatch) {
        return res.status(401).json({
          error: 'Old password is incorrect',
        });
      }

      const newHashedPassword = await bcrypt.hash(newPassword, 12);

      await prisma.user.update({
        where: {
          id: Number(session.user.id),
        },
        data: {
          password: newHashedPassword,
        },
      });

      return res.status(200).json({
        message: 'Update Password Successfully',
      });
    }

    if (email) {
      const updatedUser = await prisma.user.update({
        where: {
          id: existingUser.id,
        },
        data: {
          email,
        },
      });

      return res.status(200).json({
        data: updatedUser,
        message: 'Update Email Successfully',
      });
    }

    return res.status(404).json({
      error: 'You are missing the body data',
    });
  } catch (error: any) {
    return res.status(500).json({
      error: 'Fail to update user: ' + error,
    });
  }
}
