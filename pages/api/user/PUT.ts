import { PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';
import bcrypt from 'bcrypt';
import checkValidEmail from '../utils/checkValidEmail';

interface BodyProps {
  userId: string;
  email?: string;
  currentPassword?: string;
  newPassword?: string;
  sheetName?: string;
}

export default async function PUT(req: NextApiRequest, res: NextApiResponse) {
  try {
    const prisma = new PrismaClient();

    const {
      userId,
      email,
      currentPassword,
      newPassword,
      sheetName,
    }: BodyProps = req.body;

    const existingUser = await prisma.user.findUnique({
      where: {
        id: parseInt(userId),
      },
    });

    if (!existingUser) {
      return res.status(404).json({ error: 'User Not Found' });
    }

    const updateFields: any = {};

    if (email) {
      const correctEmail = email.trim();
      if (correctEmail !== existingUser.email) {
        const isEmailValid = await checkValidEmail(prisma, correctEmail);
        if (!isEmailValid) {
          return res.status(400).json({
            error: 'Email Is Existed',
          });
        }
      }
      updateFields.email = correctEmail;
    }

    if (currentPassword && newPassword) {
      const checkOldPassword = await bcrypt.compare(
        currentPassword,
        existingUser.password,
      );
      if (!checkOldPassword) {
        return res.status(400).json({
          error: 'Incorrect Current Password',
        });
      }
      updateFields.password = await bcrypt.hash(newPassword, 12);
    }

    if (sheetName) {
      updateFields.sheetName = sheetName;
    }

    const updatedUser = await prisma.user.update({
      where: {
        id: parseInt(userId),
      },
      data: updateFields,
    });

    return res.status(200).json({
      data: updatedUser,
      message: 'User Data Updated Successfully',
    });
  } catch (error) {
    console.log('Internal Server Error', error);
    return res.status(500).json({ error: 'Internal Server Error ' + error });
  }
}
