import { PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';
import { getUserInfo } from '../../utils/auth';

interface IBody {
  name: string;
  address: string;
  phoneNumber: string;
  joinedDate: string;
  createdAt: string;
}

export default async function POST(req: NextApiRequest, res: NextApiResponse) {
  try {
    const prisma = new PrismaClient();

    const {
      name,
      address,
      phoneNumber,
      joinedDate,
      createdAt,
    }: IBody = req.body;

    const existingVendor = await prisma.vendor.findFirst({
      where: {
        name,
        address,
        phoneNumber,
      },
    });

    if (existingVendor) {
      return res.status(500).json({
        error: 'Vendor Address Existed Already',
      });
    }

    const admin: any = await getUserInfo(req, res);

    const newVendor = await prisma.vendor.create({
      data: {
        name,
        address,
        phoneNumber,
        joinedDate,
        createdAt,
        createdBy: `Admin - ${admin.clientName}`,
      },
    });
    
    return res.status(200).json({
      data: newVendor,
      message: 'Create New Vendor Successfully',
    });

  } catch (error: any) {
    console.log('Internal Server Error: ', error);
    return res.status(500).json({
      error: 'Internal Server Error: ' + error,
    });
  }
}
