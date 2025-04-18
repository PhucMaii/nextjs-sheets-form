import { PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';

interface IBody {
  id: number;
  name: string;
  address: string;
  phoneNumber: string;
  email: string;
  joinedDate: string;
}

export default async function PUT(req: NextApiRequest, res: NextApiResponse) {
  try {
    const prisma = new PrismaClient();

    const { id, name, address, phoneNumber, email, joinedDate }: IBody = req.body;

    if (!name || !address || !joinedDate) {
      return res.status(404).json({
        error: 'You are missing body data',
      });
    }

    const existingVendor = await prisma.vendor.findUnique({
      where: {
        id,
      },
    });

    if (!existingVendor) {
      return res.status(404).json({
        error: 'Vendor Not Found',
      });
    }

    const existingUpdatedVendor = await prisma.vendor.findFirst({
      where: {
        name,
        address,
        phoneNumber,
        id: {
          not: id,
        },
      },
    });

    if (existingUpdatedVendor) {
      return res.status(400).json({
        error: 'Vendor Already Exists',
      });
    }

    const updatedVendor = await prisma.vendor.update({
      where: {
        id,
      },
      data: {
        name,
        email,
        address,
        phoneNumber,
        joinedDate,
      },
    });

    return res.status(200).json({
      message: 'Vendor Updated Successfully',
      data: updatedVendor,
    });
  } catch (error: any) {
    console.log('Internal Server Error: ', error);
    return res.status(500).json({
      error: 'Internal Server Error: ' + error,
    });
  }
}
