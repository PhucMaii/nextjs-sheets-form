import { USER_ROLE } from '@/app/utils/enum';
import { PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';

export type UpdateAdmin = {
  clientName: string;
  role: USER_ROLE;
  email: string;
  contactNumber: string;
};

interface IBody {
  id: number;
  updatedAdmin: any;
}

export default async function PUT(req: NextApiRequest, res: NextApiResponse) {
  try {
    const prisma = new PrismaClient();

    const { id, updatedAdmin }: IBody = req.body;

    const existingAdmin: any = await prisma.user.findUnique({
      where: {
        id: id,
      },
    });

    if (!existingAdmin) {
      return res.status(404).json({
        error: 'Admin Id Not Found',
      });
    }

    // Extract the updated fields by filter and reduce
    const updatedField = Object.keys(updatedAdmin)
      .filter((key: string) => updatedAdmin[key] !== existingAdmin[key])
      .reduce((acc: any, key: string) => {
        acc[key] = updatedAdmin[key];
        return acc;
      }, {});

    const updatedUser = await prisma.user.update({
      where: {
        id: id,
      },
      data: updatedField,
    });

    return res.status(200).json({
      data: updatedUser,
      message: 'Admin Updated Successfully',
    });
  } catch (error: any) {
    console.log('Internal Server Error: ', error);
    return res.status(500).json({ error: 'Internal Server Error: ' + error });
  }
}
