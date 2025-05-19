import { PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';
import bcrypt from 'bcryptjs';

interface IBody {
  oldPassword?: string;
  newPassword?: string;
  email?: string;
  name?: string;
  id: number;
}

export default async function PUT(req: NextApiRequest, res: NextApiResponse) {
  try {
    const prisma = new PrismaClient();
    const { oldPassword, newPassword, email, name, id }: IBody = req.body;

    const existingUser = await prisma.employee.findUnique({
      where: {
        id,
      },
    });

    if (!existingUser) {
      return res.status(404).json({
        error: 'Admin Not Found',
      });
    }

    // Update Password
    if (oldPassword && newPassword) {
      console.log({ oldPassword, newPassword }, 'oldPassword && newPassword');
      const isOldPasswordMatch = await bcrypt.compare(
        oldPassword,
        existingUser.password,
      );
      if (!isOldPasswordMatch) {
        return res.status(404).json({
          error: 'Old password is incorrect',
        });
      }

      const newHashedPassword = await bcrypt.hash(newPassword, 12);

      await prisma.employee.update({
        where: {
          id,
        },
        data: {
          password: newHashedPassword,
        },
      });

      return res.status(200).json({
        message: 'Update Password Successfully',
      });
    }

    if (email && name) {
      const updatedUser = await prisma.employee.update({
        where: {
          id: existingUser.id,
        },
        data: {
          email,
          name,
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
    console.log('Internal Server Error: ', error);
    return res.status(500).json({
      error: 'Internal Server Error: ' + error,
    });
  }
}
